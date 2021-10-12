const InputStreamDef = Java.use("java.io.FileInputStream")
const OutputStreamDef = Java.use("java.io.FileOutputStream")
const FilesDef = Java.use("java.nio.file.Files")

export function openInStream(path) {
    return InputStreamDef.$new.overload('java.lang.String').call(InputStreamDef, path)
}

export function openOutStream(path) {
    return OutputStreamDef.$new.overload('java.lang.String').call(OutputStreamDef, path)
}

export function copyFile(original, dest) {
    FilesDef.copy.overload('java.io.InputStream', 'java.io.OutputStream').call(
        FilesDef, openInStream(original), openOutStream(dest)
    )
}