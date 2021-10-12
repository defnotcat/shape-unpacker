# shape-unpacker

Simple frida agent used to unpack internal classes (`com.apiguard3.internal.xxxxx`) and native library (`libag3.so`) from Android applications running Shape SDK

Before running this make sure to create the files on your device and give them permissions:

`adb shell su -c "touch /data/local/tmp/libag3.so /data/local/tmp/internal.dex" && adb shell su -c "chmod 777 /data/local/tmp/libag3.so /data/local/tmp/internal.dex"`