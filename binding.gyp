{
  "targets": [
    {
      "target_name": "raptorq",
      "sources": [ "raptorq.cc" ],
      "include_dirs" : [
    "<!(node -e \"require('nan')\")"
]
    }
  ]
}