#include "/Users/fuyingdi/libRaptorQ/src/RaptorQ/RaptorQ_v1_hdr.hpp"
#include <iostream>
#include <fstream>
#include <stdlib.h>
#include <algorithm>
using symbol_id = uint32_t;
namespace RaptorQ = RaptorQ__v1;

std::vector<std::vector<uint8_t>> received;
const uint16_t symbol_size = 65500;
std::vector<uint8_t> input;
std::vector<uint8_t> output;
int g_len;
std::vector<uint8_t> res;

// 传入了两个参数，args[0] 字符串，args[1] 回调函数
void encode() {
    std::ifstream in("./tmp_data", std::ifstream::binary);
    in.seekg(0,in.end);
    int len = in.tellg();
    g_len = len;
    input.resize(len);
    char* a = (char*)&*input.begin();
    in.seekg(0,in.beg);
    in.read(a,len);
    using T_it = typename std::vector<uint8_t>::iterator;
    RaptorQ::Encoder<T_it, T_it> enc (RaptorQ::Block_Size::Block_225 , 65500);
    enc.set_data(input.begin(),input.end());
    enc.compute_sync();
    //std::vector<std::pair<symbol_id, std::vector<uint8_t>>> received;
    auto source_sym_it = enc.begin_source();
    //source_sym_it++;
    for(;source_sym_it!=enc.end_source();++source_sym_it){
        std::vector<uint8_t> source_sym_data(symbol_size,0);
        auto it = source_sym_data.begin();
        (*source_sym_it)(it, source_sym_data.end());
        if(rand()%30==0)continue;
        symbol_id id = (*source_sym_it).id();
        uint8_t low_id = id&0x00FF;
        uint8_t high_id = id>>8;

        source_sym_data.insert(source_sym_data.begin(),low_id);
        source_sym_data.insert(source_sym_data.begin(),high_id);
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
      // symbol_id id = (*repair_sym_it).id();
      // received.emplace_back(id, std::move(repair_sym_data));
    }
      
    random_shuffle(received.begin(), received.end());
    for(int i=0;i<20;i++)
    {
      received.erase(received.begin());
    }
    int i=0;
    for(auto &x:received)
    {
        for(auto &y:x)
        {
          res.push_back(y);
        }
    }
    std::ofstream outf("encoded_data", std::ofstream::binary);
    outf.write((char*)&*res.begin(),res.size());
    // for(auto x:received)
    // {
    //   std::cout<<x.first<<" ";
    //   std::cout<<x.second.size();
    //   for(auto y:x.second){

    //     std::cout<<(int)y;
    //   }
    //   std::cout<<"\n";
    // }
    //enc.encode(output.begin(), output.end(),);
    return;
  }

void decode(int file_size){
  // std::vector<uint8_t> m_input;
  // std::ifstream in("./encoded_data", std::ifstream::binary);
  // input.seekg(0,in.end);
  // int len = m_input.tellg();
  // //TODO:g_len = len;
  // input.resize(len);
  // char* a = (char*)&*input.begin();
  // in.seekg(0,in.beg);
  // in.read(a,len);

  ////////////
  


  ///
  std::ifstream in("./tmp_data", std::ifstream::binary);
  in.seekg(0,in.end);
  int l = in.tellg();
  res.resize(l);
  char* a = (char*)&*res.begin();
  in.seekg(0,in.beg);
  in.read(a,l);
  output.resize(file_size);
  using Decoder_type = RaptorQ::Decoder<typename std::vector<uint8_t>::iterator,typename std::vector<uint8_t>::iterator>;
  Decoder_type dec (RaptorQ::Block_Size::Block_225, symbol_size, Decoder_type::Report::COMPLETE);  
     const int len = 65502 ;
    received.empty();
    for(auto i=0;i<res.size();i+=len)
    {
        received.push_back(std::vector<uint8_t>(i+res.begin(),i+len+res.begin()));
    }
  for(auto&rec_sym:received)
  {
       uint16_t high_id = rec_sym[0];
        uint8_t low_id = rec_sym[1];
        symbol_id id = (high_id<<8)+low_id;
        auto it = rec_sym.begin()+2;
        dec.add_symbol(it, rec_sym.end(), id);
  }
    dec.end_of_input(RaptorQ::Fill_With_Zeros::NO);
    dec.wait_sync(); //decode
    size_t decode_from_byte =0;
    auto out_it = output.begin();
    auto written = dec.decode_bytes(out_it, output.end(), 0,0);

    std::ofstream out("./out", std::ofstream::binary);
    out.write((char*)&*output.begin(), written.written);
    std::cout<<(int)written.written;
    if(output==input)
    {
      std::cout<<"ok";
    }
    else{
      std::cout<<"not ok";
    }
}

int main(int argc, char* argv[])
{
  RaptorQ__v1::local_cache_size (5000000);
  char * encode_str = "encode";
  char * decode_str = "decode";
  if(!strcmp((char*)argv[1], encode_str))
  {
    encode();
    std::cout<<"encode ok";
  }
  if(!strcmp((char*)argv[1], decode_str))
  {
    decode(atoi(argv[2]));
    std::cout<<"decode ok";
  }
}