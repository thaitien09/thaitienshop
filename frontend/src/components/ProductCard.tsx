import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  currentStock: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, name, price, image, category, currentStock }) => {
  const { addToCart } = useCart();

  return (
    <div className="group cursor-pointer">
      {/* Image Area */}
      <div className="relative aspect-square bg-white border border-gray-100 overflow-hidden rounded-sm transition-all duration-700 group-hover:bg-[#f9f9f9]">
        <Link to={`/products/${id}`}>
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-contain object-center transition-transform duration-700 group-hover:scale-105"
          />
        </Link>
        <button className="absolute top-4 right-4 p-2 bg-transparent hover:text-red-500 transition-colors">
          <Heart size={20} strokeWidth={1.5} />
        </button>
        
        {/* Quick Add Overlay */}
        {currentStock > 0 ? (
          <div 
            onClick={(e) => {
              e.stopPropagation();
              addToCart({ id, name, price, image, brand: { name: category }, currentStock });
            }}
            className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-white/80 backdrop-blur-sm flex justify-center hover:bg-black hover:text-white"
          >
            <span className="text-[11px] font-bold uppercase tracking-widest">+ THÊM NHANH</span>
          </div>
        ) : (
          <div className="absolute bottom-0 left-0 w-full p-4 translate-y-0 bg-red-500/80 backdrop-blur-sm flex justify-center text-white">
            <span className="text-[11px] font-bold uppercase tracking-widest">HẾT HÀNG</span>
          </div>
        )}
      </div>

      {/* Info Area */}
      <div className="mt-5 space-y-1">
        <div className="flex justify-between items-start">
          <Link to={`/products/${id}`}>
            <h3 className="text-[14px] font-medium text-black hover:underline">{name}</h3>
          </Link>
          <span className="text-[14px] font-medium text-gray-400">{price.toLocaleString()}đ</span>
        </div>
        <p className="text-[12px] text-gray-400 uppercase tracking-wider">{category}</p>
      </div>
    </div>
  );
};

export default ProductCard;
