#include "/Users/fuyingdi/.electron-gyp/7.1.7/include/node/node.h"
#include "/Users/fuyingdi/libRaptorQ/src/RaptorQ/RaptorQ_v1_hdr.hpp"
#include <iostream>
#include <nan.h>

using symbol_id = uint16_t;
namespace RaptorQ = RaptorQ__v1;

using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::NewStringType;
using v8::Object;
using v8::String;
using v8::Value;

const uint16_t symbol_size = 65500;
using namespace v8;
using namespace Nan;

// 传入了两个参数，args[0] 字符串，args[1] 回调函数
NAN_METHOD(encode){
    char* buffer = (char*) node::Buffer::Data(info[0]->ToObject());
    size_t size = node::Buffer::Length(info[0]);
    using T_it = typename std::vector<uint8_t>::iterator;
    std::vector<uint8_t> input;
    std::vector<std::vector<uint8_t>> received;

    for(char* i=buffer;i<buffer+size;i++)
    {
        input.push_back((uint8_t)*buffer);
    }

    RaptorQ::Encoder<T_it, T_it> enc (RaptorQ::Block_Size::Block_225 , 65500);
    enc.set_data(input.begin(),input.end());
    enc.compute_sync();
    //std::vector<std::pair<symbol_id, std::vector<uint8_t>>> received;
    auto source_sym_it = enc.begin_source();
    source_sym_it++;
    for(;source_sym_it!=enc.end_source();++source_sym_it){
        std::vector<uint8_t> source_sym_data(symbol_size,0);
        auto it = source_sym_data.begin();
        (*source_sym_it)(it, source_sym_data.end());
        symbol_id id = (uint16_t)(*source_sym_it).id();
        uint8_t low_id = id&0x00FF;
        uint8_t high_id = id>>8;

        source_sym_data.insert(source_sym_data.begin(),high_id);
        source_sym_data.insert(source_sym_data.begin(),low_id);
        
        received.emplace_back (std::move(source_sym_data));
    }
    auto repair_sym_it = enc.begin_repair();
    for(;received.size()<(enc.symbols()*1.2);++repair_sym_it){
        std::vector<uint8_t> repair_sym_data(symbol_size,0);

        auto it = repair_sym_data.begin();
          
        (*repair_sym_it)(it, repair_sym_data.end());
        
        symbol_id id = (*repair_sym_it).id();
        uint8_t low_id = id&0x00FF;
        uint8_t high_id = id>>8;

        repair_sym_data.insert(repair_sym_data.begin(),low_id);
        repair_sym_data.insert(repair_sym_data.begin(),high_id);
        received.emplace_back (std::move(repair_sym_data));
    }

    uint8_t *res = new uint8_t[350*65500];
    int i=0;
    for(auto &x:received)
    {
        for(auto &y:x)
        {
          res[i++]=y;
        }
    }

    info.GetReturnValue().Set(Nan::NewBuffer((char*)res, i).ToLocalChecked());
};

NAN_METHOD(decode){
    std::vector<uint8_t> output;
    output.resize(225*65500);
    char* buffer = (char*) node::Buffer::Data(info[0]->ToObject());
    size_t size = node::Buffer::Length(info[0]);

    symbol_id tmp_id;

    const int len = 65502 ;
    std::vector<std::vector<uint8_t>> received;
    for(auto i=buffer;i<buffer+size;i+=len)
    {
        received.push_back(std::vector<uint8_t>(i,i+len));
    }

    using Decoder_type = RaptorQ::Decoder<typename std::vector<uint8_t>::iterator,typename std::vector<uint8_t>::iterator>;
    Decoder_type dec (RaptorQ::Block_Size::Block_225, symbol_size, Decoder_type::Report::COMPLETE);  
    for(auto&rec_sym:received)
    {
        uint16_t high_id = rec_sym[0];
        uint8_t low_id = rec_sym[1];
        symbol_id id = (high_id<<8)+low_id;
        tmp_id = id;
        auto it = rec_sym.begin()+2;
        dec.add_symbol(it, rec_sym.end(), id);
    }
    dec.end_of_input(RaptorQ::Fill_With_Zeros::NO);
    dec.wait_sync(); //decode
    // size_t decode_from_byte =0;
    auto out_it = output.begin();
    dec.decode_bytes(out_it, output.end(), 0,0);

    char * res = new char[350*65500];
    int i=0;
    for(auto x:output)
    {
        res[i++]=x;
    }

    info.GetReturnValue().Set(Nan::NewBuffer(res, i).ToLocalChecked());
    // info.GetReturnValue().Set(Nan::New((int)output.size()));
};


// }

NAN_MODULE_INIT(Init) {
    Nan::Set(target, New<String>("encode").ToLocalChecked(),
        GetFunction(New<FunctionTemplate>(encode)).ToLocalChecked());  
    Nan::Set(target, New<String>("decode").ToLocalChecked(),
        GetFunction(New<FunctionTemplate>(decode)).ToLocalChecked());
}

// void Initialize(v8::Handle<v8::Object> exports) {
//   NODE_SET_METHOD(exports, "encode", encode);
//   //NODE_SET_METHOD(exports, "decode", decode);
// }

NODE_MODULE(NODE_GYP_MODULE_NAME, Init)
