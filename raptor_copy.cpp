#include "/Users/fuyingdi/libRaptorQ/src/RaptorQ/RaptorQ_v1_hdr.hpp"
#include <iostream>
using symbol_id = uint32_t;
namespace RaptorQ = RaptorQ__v1;

const uint16_t symbol_size = 1200;
std::vector<std::pair<symbol_id, std::vector<uint8_t>>> received;
std::vector<uint8_t> output{0x00,0x00,0x00};

// 传入了两个参数，args[0] 字符串，args[1] 回调函数
void encode() {
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
        symbol_id id = (*source_sym_it).id();
        received.emplace_back (id, std::move(source_sym_data));
    }
    auto repair_sym_it = enc.begin_repair();
    for(;received.size()<(enc.symbols()*1.2);++repair_sym_it){
      std::vector<uint8_t> repair_sym_data(symbol_size,0);

      auto it = repair_sym_data.begin();
      (*repair_sym_it)(it, repair_sym_data.end());
      symbol_id id = (*repair_sym_it).id();
      received.emplace_back(id, std::move(repair_sym_data));
      
    }
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

void decode(){
  std::cout<<"\n"<<received.size()<<"\n";
  using Decoder_type = RaptorQ::Decoder<typename std::vector<uint8_t>::iterator,typename std::vector<uint8_t>::iterator>;
  Decoder_type dec (RaptorQ::Block_Size::Block_42, symbol_size, Decoder_type::Report::COMPLETE);  
  for(auto&rec_sym:received)
  {
    symbol_id id = rec_sym.first;
    auto it = rec_sym.second.begin();
    dec.add_symbol(it, rec_sym.second.end(), id);
  }
    dec.end_of_input(RaptorQ::Fill_With_Zeros::NO);
    dec.wait_sync(); //decode
    // size_t decode_from_byte =0;
    auto out_it = output.begin();
    dec.decode_bytes(out_it, output.end(), 0,0);
  for(auto x:input)
  {
    std::cout<<(int)x;
  }
  for(uint8_t x:output)
  {
    std::cout<<(int)x;
  }
}

int main()
{
  RaptorQ__v1::local_cache_size (5000000);
  encode();
  decode();
}