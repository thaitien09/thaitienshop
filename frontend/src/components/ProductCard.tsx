import React from 'react';
import { Heart } from 'lucide-react';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ name, price, image, category }) => {
  return (
    <div className="group cursor-pointer">
      {/* Image Area */}
      <div className="relative aspect-[4/5] bg-[#f2f2f2] overflow-hidden rounded-sm transition-all duration-700 group-hover:bg-[#ebebeb]">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-contain object-center scale-90 group-hover:scale-100 transition-transform duration-700"
        />
        <button className="absolute top-4 right-4 p-2 bg-transparent hover:text-red-500 transition-colors">
          <Heart size={20} strokeWidth={1.5} />
        </button>
        
        {/* Quick Add Overlay (Optional) */}
        <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-white/80 backdrop-blur-sm flex justify-center">
          <span className="text-[11px] font-bold uppercase tracking-widest">+ Quick Add</span>
        </div>
      </div>

      {/* Info Area */}
      <div className="mt-5 space-y-1">
        <div className="flex justify-between items-start">
          <h3 className="text-[14px] font-medium text-black">{name}</h3>
          <span className="text-[14px] font-medium text-gray-400">{price.toLocaleString()}đ</span>
        </div>
        <p className="text-[12px] text-gray-400 uppercase tracking-wider">{category}</p>
      </div>
    </div>
  );
};

export default ProductCard;
