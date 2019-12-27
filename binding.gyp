{
  "targets": [
    {
      "target_name": "raptorq",
      "sources": [ "raptorq.cc" ],
      "include_dirs" : [
        "<!(node -e \"require('nan')\")"
],
      "link_settings":{
        "libraries":[
          "/Users/fuyingdi/ElectronIM/libRaptorQ.1.a",
          "/usr/lib/libpthread.dylib"
        ],
      },
      # "cflags!":["-fno-exceptions"],
      # "cflags_cc!":["-fno-exceptions"],
      "defines":["NAPI_CPP_EXCEPTIONS"],
      "xcode_settings":{
        "GCC_ENABLE_CPP_EXCEPTIONS":"YES"
      }
    }
  ]
}