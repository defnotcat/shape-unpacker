import { openOutStream, copyFile } from "./utils"

const ClassDef = Java.use("java.lang.Class")
const ClassLoaderDef = Java.use("dalvik.system.InMemoryDexClassLoader")
const TestInternalClass = "com.apiguard3.internal.dpi" // The internal class you're looking for
const JavaExportPath = "/data/local/tmp/internal.dex"
const NativeExportPath = "/data/local/tmp/libag3.so"
const OnJavaUnpack = function(data) {
    var stream = openOutStream(JavaExportPath)
    stream.write(data)
    stream.close()
    console.log(`Wrote ${data.length} bytes to ${JavaExportPath}`)
}
const OnNativeUnpack = function(path) {
    copyFile(path.toString(), NativeExportPath)
    console.log(`Copied ${path} to ${NativeExportPath}`)
}

var dexElements = {}
var internalIsLoaded = false

Java.use("dalvik.system.DexPathList")["makeInMemoryDexElements"].implementation =
    function(buffers, _) {
        var dexBytes = Java.array('byte', buffers[0].array())

        var retVal = this["makeInMemoryDexElements"](buffers, _)
        dexElements[retVal.toString()] = dexBytes

        var loader = getClassLoader()
        if(loader && !internalIsLoaded) {
            internalIsLoaded = true
            OnJavaUnpack(dexElements[loader.pathList.value.dexElements.value[0].toString()])
        }

        return retVal
    }

// Alternative way, the only one that works on my samsung device, for some odd reason
Java.use("dalvik.system.InMemoryDexClassLoader").$init.overload('[Ljava.nio.ByteBuffer;', 'java.lang.ClassLoader').implementation =
    function(buffers, _) {
        var dexBytes = Java.array('byte', buffers[0].array())

        var retVal = this.$init.apply(this, [buffers, _])
        dexElements[this.pathList.value.dexElements.value[0].toString()] = dexBytes

        var loader = getClassLoader()
        if(loader && !internalIsLoaded) {
            internalIsLoaded = true
            OnJavaUnpack(dexElements[loader.pathList.value.dexElements.value[0].toString()])
        }
    }

Java.use("java.lang.Runtime")["load"].overload('java.lang.String', 'java.lang.ClassLoader').implementation =
    function(path, _) {
        if(path.indexOf('libag3.so') !== -1)
            OnNativeUnpack(path.toString())
        this["load"].apply(this, arguments)
    }

function hasInternalClass(classLoader) {
    try {
        ClassDef.forName(TestInternalClass, true, classLoader)
        return true
    } catch(_) { }
    return false
}
    
function getClassLoader() {
    var classLoader = Java.enumerateClassLoadersSync().find(cl => hasInternalClass(cl))
    if(!classLoader) return undefined
    Java.classFactory.loader = classLoader
    return Java.cast(classLoader, ClassLoaderDef)
}