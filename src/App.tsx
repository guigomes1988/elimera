import { useState, useEffect } from "react";
import { Menu, X, ArrowRight, ShieldCheck, Sparkles, BookOpen, Clock, AlertCircle, Heart, Gem, FlaskConical, ArrowUpRight, ChevronDown, Truck, RefreshCw, Instagram, Facebook, ShoppingBag, Plus, Minus, Trash2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type NavItem = "Sobre" | "Produtos" | "Chancela" | "Políticas";

type Product = {
  id: string;
  category: string;
  name: string;
  subtitle: string;
  description: string;
  benefits: string[];
  image: string;
  checkoutUrl: string;
  price: number;
  token: string;
  skuId?: string;
};

type CartItem = {
  product: Product;
  quantity: number;
};

const PRODUCTS: Product[] = [
  {
    id: "batom-matte",
    category: "LÁBIOS",
    name: "Batom Matte",
    subtitle: "Cor matte com toque hidratante - 4g",
    description: "Um batom matte com ácido hialurônico, desenvolvido para unir acabamento sofisticado, conforto e cuidado em um gesto essencial de beleza.",
    benefits: [
      "Acabamento matte elegante",
      "Com ácido hialurônico",
      "Cruelty free, livre de parabenos e petrolatos"
    ],
    image: "/produto-03.png",
    checkoutUrl: "https://elimera.pay.yampi.com.br/r/8XVEIIMKLT",
    price: 59.90,
    token: "8XVEIIMKLT",
    skuId: "BATOMMATTE"
  },
  {
    id: "glow-lift",
    category: "CORPO",
    name: "Glow & Lift",
    subtitle: "Firmeza e hidratação corporal - 200ml",
    description: "Creme firmador corporal de alta performance, criado para promover hidratação intensa, toque acetinado e uma aparência mais tonificada.",
    benefits: [
      "Com óleo de uva, elastina, colágeno, mica e Q10",
      "Ácido hialurônico hidratante",
      "Hidratação profunda, cruelty free e livre de parabenos"
    ],
    image: "/produto-02.png",
    checkoutUrl: "https://elimera.pay.yampi.com.br/r/50BJSNV0QW",
    price: 129.90,
    token: "50BJSNV0QW",
    skuId: "GLOWLIFT"
  },
  {
    id: "gold-lift",
    category: "CORPO",
    name: "Gold & Lift",
    subtitle: "Glow dourado e pele iluminada - 200ml",
    description: "Creme iluminador corporal com efeito glow dourado, pensado para hidratar, realçar a pele e entregar luminosidade sofisticada.",
    benefits: [
      "Com óleo de uva, colágeno, elastina e coenzima Q10",
      "Brilho imediato e toque acetinado",
      "Hidratação profunda, cruelty free e livre de parabenos"
    ],
    image: "/produto-01.png",
    checkoutUrl: "https://elimera.pay.yampi.com.br/r/4EF7TNQSBD",
    price: 129.90,
    token: "4EF7TNQSBD",
    skuId: "GOLDLIFT"
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<NavItem | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Interactive UI overlays to handle CTA actions elegantly without navigating away
  const [activeOverlay, setActiveOverlay] = useState<"produtos" | "origem" | "product_detail" | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [activePolicy, setActivePolicy] = useState<number>(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  // Carrinho de Compras State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("elimera_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cardQuantities, setCardQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      localStorage.setItem("elimera_cart", JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  const addToCart = (product: Product, qty: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { product, quantity: qty }];
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    // Formata cada item no padrão exato TOKEN:QUANTIDADE (exemplo: 8XVEIIMKLT:1)
    const formattedItems = cart.map(
      (item) => `${item.product.token}:${item.quantity}`
    );

    // Una todos os itens formatados em uma única string, usando vírgula como separador
    const consolidatedItems = formattedItems.join(",");

    // Concatena essa string à URL base da Yampi: https://elimera.pay.yampi.com.br/r/
    const finalUrl = `https://elimera.pay.yampi.com.br/r/${consolidatedItems}`;

    // Executa o redirecionamento (window.location.href)
    window.location.href = finalUrl;
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      const footerElement = document.getElementById("footer");
      if (footerElement) {
        const rect = footerElement.getBoundingClientRect();
        // O header deve sumir quando o footer estiver quase tocando o topo da tela (< 200px do topo)
        setIsFooterVisible(rect.top < 200);
      } else {
        setIsFooterVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const menuItems: NavItem[] = ["Sobre", "Produtos", "Chancela", "Políticas"];

  const handleLogoClick = () => {
    setActiveTab(null);
    setActiveOverlay(null);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavClick = (item: NavItem) => {
    setActiveTab(item);
    setMobileMenuOpen(false);
    
    // Smooth scroll simulation/display info based on the selected tab
    if (item === "Produtos") {
      setActiveOverlay(null);
      setTimeout(() => {
        const section = document.getElementById("produtos-section");
        if (section) section.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } else if (item === "Sobre") {
      setActiveOverlay(null);
      setTimeout(() => {
        const section = document.getElementById("origem-marca-section");
        if (section) section.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } else if (item === "Chancela") {
      setActiveOverlay(null);
      setTimeout(() => {
        const section = document.getElementById("chancela-section");
        if (section) section.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } else if (item === "Políticas") {
      setActiveOverlay(null);
      setTimeout(() => {
        const section = document.getElementById("politicas-section");
        if (section) section.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } else {
      setActiveOverlay(null);
    }
  };

  return (
    <div 
      id="app-container" 
      className="w-full min-h-screen bg-[#2d5642] text-white flex flex-col font-manrope font-light relative select-none"
    >
      {/* Hero Section Container matching image visually without distortion */}
      <div 
        id="hero-section" 
        className="w-full relative flex flex-col justify-between bg-cover bg-center bg-no-repeat h-[800px] sm:h-[928px] md:h-[1024px] lg:h-[1088px] min-h-[768px]"
        style={{
          backgroundImage: "url('/fundo%20hero.webp')"
        }}
      >
        {/* Premium ambient light glow - matches gold (#ae985e) mixed with emerald depths */}
        <div 
          id="ambient-glow-center"
          className="absolute inset-0 pointer-events-none transition-all duration-1000"
          style={{
            background: `radial-gradient(circle at 50% 45%, rgba(174, 152, 94, 0.12) 0%, rgba(45, 86, 66, 0) 65%)`
          }}
        />
      
      {/* --- NAVIGATION BAR --- */}
      <motion.nav 
        id="navbar"
        initial={{ opacity: 0, y: -20 }}
        animate={{ 
          opacity: isFooterVisible ? 0 : 1, 
          y: isFooterVisible ? -100 : 0 
        }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 w-full z-50 px-6 sm:px-12 md:px-16 lg:px-24 transition-colors duration-300 ${
          isScrolled || mobileMenuOpen
            ? "bg-[#003829]" 
            : "bg-transparent pt-4"
        } ${isFooterVisible ? 'pointer-events-none' : ''}`}
      >
        <div className={`max-w-7xl mx-auto flex justify-between items-center w-full transition-all duration-300 ${isScrolled || mobileMenuOpen ? "py-4" : "py-6"}`}>
          {/* Logo */}
          <motion.div 
            id="brand-logo"
            whileHover={{ scale: 1.02 }}
            className="flex items-center cursor-pointer"
            onClick={handleLogoClick}
          >
            <img 
              src="/elimera lettering@4x.png" 
              alt="ELIMERA Logo" 
              className="h-16 w-auto object-contain" 
              referrerPolicy="no-referrer"
            />
          </motion.div>

          {/* Desktop Navigation Items */}
          <div id="desktop-menu" className="hidden md:flex items-center space-x-10">
            {menuItems.map((item) => {
              const isActive = activeTab === item;
              return (
                <button
                  key={item}
                  id={`nav-item-${item.toLowerCase()}`}
                  onClick={() => handleNavClick(item)}
                  className={`text-sm tracking-wide transition-all duration-300 relative py-1 hover:text-white ${
                    isActive ? "text-white font-medium" : "text-[#b7995a]"
                  }`}
                >
                  <span>{item}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeUnderline"
                      className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#b7995a]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Action CTA & Cart Button */}
          <div id="desktop-cta" className="hidden md:flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full border border-[#b7995a]/40 text-[#b7995a] hover:bg-[#b7995a]/10 hover:text-white transition-all duration-300 flex items-center justify-center cursor-pointer"
              aria-label="Abrir Carrinho"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#b7995a] text-[#1b3b2c] font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                  {totalItemsCount}
                </span>
              )}
            </motion.button>

            <motion.button
              id="cta-nav"
              whileHover={{ scale: 1.04, backgroundColor: "#caad6e" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const section = document.getElementById("produtos-section");
                if (section) section.scrollIntoView({ behavior: "smooth" });
              }}
              className="rounded-full px-6 py-2.5 text-xs font-bold tracking-widest uppercase bg-[#b7995a] text-[#1b3b2c] transition-colors duration-300 shadow-md shadow-black/10 flex items-center justify-center hover:shadow-lg hover:shadow-black/15"
            >
              <span>Conhecer produtos</span>
            </motion.button>
          </div>

          {/* Mobile Menu & Cart Trigger */}
          <div id="mobile-menu-trigger" className="md:hidden flex items-center gap-3">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[#b7995a] hover:text-white transition-colors"
              aria-label="Abrir Carrinho"
            >
              <ShoppingBag className="w-6 h-6" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#b7995a] text-[#1b3b2c] font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItemsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:text-[#b7995a] transition-colors p-1 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              id="mobile-nav-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden relative z-30 bg-transparent flex flex-col pb-6 pt-2 space-y-5"
            >
              {menuItems.map((item) => (
                <button
                  key={item}
                  id={`mobile-nav-item-${item.toLowerCase()}`}
                  onClick={() => handleNavClick(item)}
                  className={`text-left text-lg tracking-wide py-1.5 transition-colors ${
                    activeTab === item ? "text-white font-medium pl-2 border-l-2 border-[#b7995a]" : "text-[#b7995a]"
                  }`}
                >
                  {item}
                </button>
              ))}
              <div className="pt-4 border-t border-white/5">
                <button
                  id="mobile-cta-nav"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    const section = document.getElementById("produtos-section");
                    if (section) section.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full text-center rounded-full py-4 text-xs font-bold tracking-widest uppercase bg-[#b7995a] text-[#1b3b2c] shadow-md active:scale-95 transition-transform"
                >
                  Conhecer produtos
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* --- HERO SECTION CONTAINER --- */}
      <main id="hero-main" className="flex-grow flex items-center justify-start relative z-10 px-6 sm:px-12 md:px-16 lg:px-24">
        <div className="max-w-7xl mx-auto w-full pt-16 sm:pt-20 md:pt-24 pb-16 sm:pb-24 md:pb-32 flex flex-col items-start justify-center text-left">
          
          {/* Topic Title (Tagline badge with gold typography) */}
          <motion.div
            id="hero-topic-title"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6"
          >
            <span className="text-xs sm:text-sm tracking-[0.25em] uppercase font-manrope font-semibold text-[#b7995a]">
              Beleza • Ciência • Essência
            </span>
          </motion.div>

          {/* Headline (Styled with precise line-height and tight letter spacing in Hello Branch) */}
          <motion.h1
            id="hero-headline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(1.86rem,10.48vw,8.62rem)] font-hello-branch-regular font-normal text-white max-w-7xl leading-[0.7] tracking-[-2.46px]"
            style={{ 
              fontFamily: "'Hello Branch Regular', 'Hello Branch', 'Cormorant Garamond', 'Playfair Display', serif",
              letterSpacing: "-2.46px"
            }}
          >
            A beleza que <br />
            se revela em <br />
            você.
          </motion.h1>

          {/* Description */}
          <motion.p
            id="hero-description"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm sm:text-[15px] md:text-[17px] text-white/95 font-manrope font-light max-w-xl mt-8 leading-relaxed"
          >
            A <span className="font-medium tracking-wide">ELIMERA®</span> nasce da união entre significado, ciência cosmética e sofisticação para transformar a rotina de beleza em uma experiência de presença, cuidado e autoestima.
          </motion.p>

          {/* Hero CTA Buttons */}
          <motion.div
            id="hero-cta-group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4 mt-8 justify-start items-start sm:items-center w-full sm:w-auto"
          >
            {/* Primary Action */}
            <motion.button
              id="hero-primary-btn"
              whileHover={{ scale: 1.03, backgroundColor: "#caad6e" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                const section = document.getElementById("produtos-section");
                if (section) section.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full sm:w-auto rounded-full px-8 py-3.5 text-xs font-bold tracking-widest uppercase bg-[#b7995a] text-[#1b3b2c] shadow-xl shadow-black/15 hover:shadow-black/25 flex items-center justify-center transition-colors duration-300"
            >
              <span>Conhecer produtos</span>
            </motion.button>

            {/* Secondary Action */}
            <motion.button
              id="hero-secondary-btn"
              whileHover={{ scale: 1.03, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                const section = document.getElementById("origem-marca-section");
                if (section) section.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full sm:w-auto rounded-full px-8 py-3.5 text-xs font-bold tracking-widest uppercase border border-white text-white bg-transparent flex items-center justify-center transition-all duration-300 hover:border-white/80"
            >
              <span>A origem da marca</span>
            </motion.button>
          </motion.div>

        </div>
      </main>
      </div>

      {/* --- ORIGEM DA MARCA SECTION (Light elegant brand block, #f4f1e2) --- */}
      <section 
        id="origem-marca-section" 
        className="w-full bg-[#f4f1e2] text-[#00563F] pt-24 sm:pt-32 pb-32 sm:pb-48 lg:pb-64 px-6 sm:px-12 md:px-16 lg:px-24 relative z-10"
      >
        <div className="max-w-7xl mx-auto w-full">
          {/* Top block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start pb-16">
            {/* Left side: Eyebrow and big title */}
            <div>
              <span className="text-xs sm:text-sm tracking-[0.25em] uppercase font-manrope font-semibold text-[#b7995a] block mb-6">
                A ORIGEM DA ELIMERA®
              </span>
              <h2 
                className="text-[clamp(3.96rem,9vw,8.28rem)] font-hello-branch-regular font-normal text-[#00563F] leading-[0.75] tracking-tight"
                style={{ 
                  fontFamily: "'Hello Branch Regular', 'Hello Branch', 'Cormorant Garamond', 'Playfair Display', serif"
                }}
              >
                Uma marca<br />
                que nasce de<br />
                significado.
              </h2>
            </div>

            {/* Right side: Institutional text */}
            <div className="text-sm sm:text-[16px] text-[#2d5642]/85 font-manrope font-light leading-relaxed space-y-5 md:pt-8 w-full">
              <p className="font-semibold text-[#00563F]">
                Toda grande marca nasce de uma ideia. Algumas nascem de um propósito.
              </p>
              <p>
                A ELIMERA® surgiu da convicção de que uma marca de beleza precisa carregar significado, verdade e essência. O nome nasce da união de dois símbolos especiais: Eli, de origem hebraica, associado a Deus, à fé e ao reconhecimento pela vida; e Mera, referência à esmeralda, pedra preciosa ligada à beleza, renovação, sabedoria, vitalidade e eternidade.
              </p>
              <p>
                Dessa união nasceu ELIMERA®: uma marca que conecta o que é essencial e verdadeiro ao que é moderno, científico e transformador.
              </p>
            </div>
          </div>

          {/* Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-16">
            {/* Card 01 - Visual */}
            <div 
              className="relative rounded-none h-[410px] overflow-hidden group border border-transparent hover:border-[#b7995a]/30 transition-all duration-500 ease-out hover:-translate-y-1 flex flex-col justify-end"
            >
              <video 
                autoPlay 
                muted 
                playsInline 
                preload="auto"
                onEnded={(e) => {
                  e.currentTarget.currentTime = 0;
                  e.currentTarget.play().catch(() => {});
                }}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              >
                <source src="/video-loop-02.webm" type="video/webm" />
                Seu navegador não suporta vídeos.
              </video>
            </div>

            {/* Card 02 */}
            <div 
              className="bg-white rounded-none p-8 sm:p-10 flex flex-col justify-between h-[410px] w-full border border-transparent hover:border-[#b7995a]/30 transition-all duration-500 ease-out hover:-translate-y-1"
            >
              <div className="text-[#b7995a] block">
                <Heart className="w-8 h-8" strokeWidth={1.25} />
              </div>
              <div>
                <h3 
                  className="font-manrope font-semibold text-lg sm:text-[22px] text-[#00563F] leading-tight mb-3"
                >
                  Fé e essência
                </h3>
                <p className="text-xs sm:text-[15px] text-[#2d5642]/80 font-manrope font-light leading-relaxed">
                  Uma origem simbólica que traduz fé, reverência a Deus, propósito e conexão com aquilo que é verdadeiro.
                </p>
              </div>
            </div>

            {/* Card 03 */}
            <div 
              className="bg-white rounded-none p-8 sm:p-10 flex flex-col justify-between h-[410px] w-full border border-transparent hover:border-[#b7995a]/30 transition-all duration-500 ease-out hover:-translate-y-1"
            >
              <div className="text-[#b7995a] block">
                <Gem className="w-8 h-8" strokeWidth={1.25} />
              </div>
              <div>
                <h3 
                  className="font-manrope font-semibold text-lg sm:text-[22px] text-[#00563F] leading-tight mb-3"
                >
                  Esmeralda
                </h3>
                <p className="text-xs sm:text-[15px] text-[#2d5642]/80 font-manrope font-light leading-relaxed">
                  Inspiração na raridade, no brilho e na beleza atemporal de uma das pedras mais admiradas da história.
                </p>
              </div>
            </div>

            {/* Card 04 */}
            <div 
              className="bg-white rounded-none p-8 sm:p-10 flex flex-col justify-between h-[410px] w-full border border-transparent hover:border-[#b7995a]/30 transition-all duration-500 ease-out hover:-translate-y-1"
            >
              <div className="text-[#b7995a] block">
                <FlaskConical className="w-8 h-8" strokeWidth={1.25} />
              </div>
              <div>
                <h3 
                  className="font-manrope font-semibold text-lg sm:text-[22px] text-[#00563F] leading-tight mb-3"
                >
                  Ciência cosmética
                </h3>
                <p className="text-xs sm:text-[15px] text-[#2d5642]/80 font-manrope font-light leading-relaxed">
                  Fórmulas pensadas para unir ativos de qualidade, sensorialidade e uma experiência sofisticada de cuidado.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- SEÇÃO JOIA REVELADA (Full-Width Background Image/Video with Text Aligned Left) --- */}
      <section 
        id="revelacao-joia-section" 
        className="w-full min-h-[680px] lg:h-[820px] relative flex items-center justify-start bg-[#f4f1e2] overflow-hidden z-10 px-6 sm:px-12 md:px-16 lg:px-24"
      >
        {/* Camada do Fundo (100% Imagem/Vídeo sem filtros ou degradês extras por cima) */}
        <div className="absolute inset-0 w-full h-full bg-[#f4f1e2] z-0">
          {/* 
            DICA DE SUBSTITUIÇÃO PARA VÍDEO FUTURO:
            Para alternar para vídeo, descomente o bloco de código abaixo e remova a tag <img>.
            
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="/caminho-do-seu-video.mp4" type="video/mp4" />
              Seu navegador não suporta vídeos.
            </video>
          */}
          <img 
            src="/fundo-banner-01.png" 
            alt="Textura e Luz Esmeralda Premium - ELIMERA" 
            className="w-full h-full object-cover brightness-[100%]"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Lado Esquerdo - Conteúdo de Texto Alinhado à Esquerda sobreposto à Imagem (Sem Overlays de gradiente na frente da Imagem) */}
        <div className="relative z-10 w-full max-w-7xl mx-auto py-16 flex items-center justify-start">
          <div className="max-w-2xl w-full text-[#00563F] flex flex-col gap-8">
            {/* Título com impacto visual, mesmo tamanho, família e espaçamento da seção anterior */}
            <h2 
              className="text-[clamp(3.96rem,9vw,8.28rem)] font-hello-branch-regular font-normal leading-[0.75] tracking-tight text-[#00563F]"
              style={{ 
                fontFamily: "'Hello Branch Regular', 'Hello Branch', 'Cormorant Garamond', 'Playfair Display', serif"
              }}
            >
              Como uma joia,<br />
              a beleza também<br />
              se revela.
            </h2>

            {/* Textos Institucionais com o mesmo tamanho e estilo da seção anterior */}
            <div className="text-sm sm:text-[16px] text-[#00563F]/90 font-manrope font-light leading-relaxed space-y-5 w-full">
              <p>
                Assim como uma esmeralda revela seu brilho por meio da lapidação,<br className="hidden sm:block" />
                a pele também expressa sua melhor versão quando recebe cuidado,<br className="hidden sm:block" />
                tecnologia e intenção.
              </p>
              <p>
                A ELIMERA® acredita em uma beleza natural, sofisticada e possível.<br className="hidden sm:block" />
                Uma beleza que respeita a essência de cada pessoa e transforma o<br className="hidden sm:block" />
                autocuidado em um momento de reconexão.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO PRODUTOS (Vitrine Editorial) --- */}
      <section 
        id="produtos-section" 
        className="w-full bg-[#f4f1e2] py-24 sm:py-32 px-6 sm:px-12 md:px-16 lg:px-24 relative z-10 border-t border-[#00563F]/10"
      >
        <div className="max-w-7xl mx-auto w-full">
          {/* Eyebrow & Title Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-[24px] items-end mb-16 lg:mb-20">
            <div className="lg:col-span-2">
              <span className="text-xs sm:text-sm tracking-[0.25em] uppercase font-manrope font-semibold text-[#b7995a] block mb-6">
                PRODUTOS ELIMERA®
              </span>
              <h2 
                className="text-[clamp(3.96rem,9vw,8.28rem)] font-hello-branch-regular font-normal leading-[0.75] tracking-tight text-[#00563F]"
                style={{ 
                  fontFamily: "'Hello Branch Regular', 'Hello Branch', 'Cormorant Garamond', 'Playfair Display', serif"
                }}
              >
                Cuidados criados<br />
                para revelar sua<br />
                beleza.
              </h2>
            </div>
            
            <div className="lg:col-span-1 lg:pb-3 text-sm sm:text-[16px] text-[#2d5642]/85 font-manrope font-light leading-relaxed w-full">
              Poucos produtos. Mais intenção. A linha ELIMERA®<br className="hidden xl:block" />
              foi criada para valorizar fórmulas bem pensadas,<br className="hidden xl:block" />
              ativos de qualidade e experiências de uso que<br className="hidden xl:block" />
              tornam o cuidado diário mais sofisticado.
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-[24px] items-start">
            {PRODUCTS.map((product) => (
              <div key={product.id} className="flex flex-col group block cursor-pointer">
                <div className="relative w-full aspect-[3/4] sm:aspect-[4/5] bg-[#edf0eb] overflow-hidden mb-6 rounded-sm">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {/* Category & Price */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] sm:text-[11px] font-bold text-[#b7995a] uppercase tracking-[0.2em]">
                    {product.category}
                  </span>
                  <span className="text-lg font-manrope font-semibold text-[#00563F]">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <h3 
                  className="text-2xl sm:text-[28px] font-manrope font-semibold text-[#00563F] mb-2"
                >
                  {product.name}
                </h3>
                <p className="text-[14px] sm:text-[15px] font-manrope font-light text-[#2d5642]/85 mb-4">
                  {product.subtitle}
                </p>

                {/* Accordion below subtitle */}
                <div 
                  onClick={() => setExpandedProductId(expandedProductId === product.id ? null : product.id)}
                  className="flex items-center justify-between py-2.5 border-b border-[#00563F]/15 cursor-pointer text-[#7d8c7f] hover:text-[#00563F] transition-colors mb-4"
                >
                  <span className="font-manrope text-[12px] uppercase tracking-widest font-semibold">
                    Descrição do Produto
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandedProductId === product.id ? "rotate-180" : ""}`} />
                </div>

                <AnimatePresence initial={false}>
                  {expandedProductId === product.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pb-5 text-[13px] sm:text-[14px] font-manrope font-light text-[#2d5642]/85 space-y-4">
                        <p className="leading-relaxed">{product.description}</p>
                        <div>
                          <h4 className="text-[11px] uppercase tracking-wider font-semibold text-[#b7995a] mb-2 font-manrope">Benefícios Principais</h4>
                          <ul className="space-y-1 list-none">
                            {product.benefits.map((benefit, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="text-[#b7995a] mt-0.5">·</span> {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Seletor de Quantidade + Botão Comprar Agora */}
                <div className="mt-4 pointer-events-auto flex items-center gap-3">
                  <div className="flex items-center border border-[#00563F]/20 rounded-full px-3 py-2 bg-white/60 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const current = cardQuantities[product.id] || 1;
                        if (current > 1) {
                          setCardQuantities((prev) => ({ ...prev, [product.id]: current - 1 }));
                        }
                      }}
                      className="text-[#00563F] hover:text-[#b7995a] transition-colors p-1"
                      aria-label="Diminuir quantidade"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-7 text-center text-xs font-bold text-[#00563F]">
                      {cardQuantities[product.id] || 1}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const current = cardQuantities[product.id] || 1;
                        setCardQuantities((prev) => ({ ...prev, [product.id]: current + 1 }));
                      }}
                      className="text-[#00563F] hover:text-[#b7995a] transition-colors p-1"
                      aria-label="Aumentar quantidade"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02, backgroundColor: "#caad6e" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      const qty = cardQuantities[product.id] || 1;
                      addToCart(product, qty);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-full py-3 px-6 text-xs uppercase tracking-widest font-bold bg-[#b7995a] text-[#1b3b2c] shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none"
                  >
                    <span>Comprar agora</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SEÇÃO INSTITUCIONAL: CIÊNCIA COSMÉTICA --- */}
      <section className="w-full relative z-20 py-24 sm:py-32 px-6 sm:px-12 md:px-16 lg:px-24 bg-[#f4f1e2]">
        <div className="max-w-7xl mx-auto w-full">
          
          {/* Eyebrow & Title Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-[24px] items-end mb-16 lg:mb-24">
            <div className="lg:col-span-2">
              <span className="text-xs tracking-[0.25em] uppercase font-manrope font-semibold text-[#b7995a] block mb-6">
                CUIDADO COM PERFORMANCE
              </span>
              <h2 
                className="text-[clamp(3.96rem,9vw,8.28rem)] font-hello-branch-regular font-normal leading-[0.75] tracking-tight text-[#00563F]"
                style={{ 
                  fontFamily: "'Hello Branch Regular', 'Hello Branch', 'Cormorant Garamond', 'Playfair Display', serif"
                }}
              >
                Ciência<br />
                cosmética,<br />
                cuidado e<br />
                sofistica<span className="relative inline-block">c<span className="absolute -bottom-[0.05em] left-[50%] -translate-x-[50%] text-[0.5em] leading-none" style={{ fontFamily: "serif" }}>,</span></span>ão.
              </h2>
            </div>
            
            <div className="lg:col-span-1 text-[15px] sm:text-[16px] xl:text-[17px] text-[#00563F]/85 font-manrope font-light leading-relaxed w-full">
              <p className="mb-5">
                A ELIMERA® une inovação cosmética, ativos de qualidade e uma visão refinada sobre o cuidado com a pele.
              </p>
              <p>
                As fórmulas são pensadas para integrar performance, sensorialidade e bem-estar, criando produtos que fazem parte de uma rotina de beleza mais consciente e especial.
              </p>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-[18px]">
            
            {/* Card 01 */}
            <div className="group relative rounded-sm overflow-hidden h-[380px] sm:h-[400px] lg:h-[420px] bg-[#dcebe5] isolation-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-[#c6ddd3] to-[#eaf3ef] transition-transform duration-1000 group-hover:scale-105 origin-center">
                <img 
                  src="/textura01.png" 
                  alt="Ativos reconhecidos" 
                  className="w-full h-full object-cover grayscale-[15%] brightness-[90%] group-hover:scale-105 transition-transform duration-1000 ease-out" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
              
              <div className="absolute inset-0 p-8 flex flex-col justify-end z-20">
                <h3 className="text-xl font-manrope font-semibold text-[#f4f1e2] mb-3">
                  Ativos reconhecidos
                </h3>
                <p className="text-[14px] text-[#f4f1e2]/90 font-manrope font-light leading-relaxed">
                  Ingredientes selecionados <br />
                  para uma rotina de cuidado <br />
                  com mais intenção.
                </p>
              </div>
            </div>

            {/* Card 02 */}
            <div className="group relative rounded-sm overflow-hidden h-[380px] sm:h-[400px] lg:h-[420px] bg-[#dcebe5] isolation-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-[#c6ddd3] to-[#eaf3ef] transition-transform duration-1000 group-hover:scale-105 origin-center">
                <img 
                  src="/magnific__faa-uma-imagem-realista-e-editorial-de-um-close-up__4534.png" 
                  alt="Sensorial elegante" 
                  className="w-full h-full object-cover grayscale-[15%] brightness-[90%] group-hover:scale-105 transition-transform duration-1000 ease-out" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
              
              <div className="absolute inset-0 p-8 flex flex-col justify-end z-20">
                <h3 className="text-xl font-manrope font-semibold text-[#f4f1e2] mb-3">
                  Sensorial elegante
                </h3>
                <p className="text-[14px] text-[#f4f1e2]/90 font-manrope font-light leading-relaxed">
                  Texturas, fragrâncias e aplicação pensadas para uma experiência sofisticada.
                </p>
              </div>
            </div>

            {/* Card 03 */}
            <div className="group relative rounded-sm overflow-hidden h-[380px] sm:h-[400px] lg:h-[420px] bg-[#dcebe5] isolation-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-[#c6ddd3] to-[#eaf3ef] transition-transform duration-1000 group-hover:scale-105 origin-center">
                <img 
                  src="/textura03.png" 
                  alt="Beleza natural" 
                  className="w-full h-full object-cover grayscale-[15%] brightness-[90%] group-hover:scale-105 transition-transform duration-1000 ease-out" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
              
              <div className="absolute inset-0 p-8 flex flex-col justify-end z-20">
                <h3 className="text-xl font-manrope font-semibold text-[#f4f1e2] mb-3">
                  Beleza natural
                </h3>
                <p className="text-[14px] text-[#f4f1e2]/90 font-manrope font-light leading-relaxed">
                  Produtos que valorizam o brilho, <br />
                  a textura e a expressão individual <br />
                  da pele.
                </p>
              </div>
            </div>

            {/* Card 04 */}
            <div className="group relative rounded-sm overflow-hidden h-[380px] sm:h-[400px] lg:h-[420px] bg-[#dcebe5] isolation-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-[#c6ddd3] to-[#eaf3ef] transition-transform duration-1000 group-hover:scale-105 origin-center">
                <img 
                  src="/textura04.png" 
                  alt="Cuidado diário" 
                  className="w-full h-full object-cover grayscale-[15%] brightness-[90%] group-hover:scale-105 transition-transform duration-1000 ease-out" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
              
              <div className="absolute inset-0 p-8 flex flex-col justify-end z-20">
                <h3 className="text-xl font-manrope font-semibold text-[#f4f1e2] mb-3">
                  Cuidado diário
                </h3>
                <p className="text-[14px] text-[#f4f1e2]/90 font-manrope font-light leading-relaxed">
                  Uma proposta de autocuidado <br />
                  que acompanha a rotina com <br />
                  presença e delicadeza.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- SEÇÃO CHANCELA DRA. CLAUDIA MIRANDA --- */}
      <section id="chancela-section" className="w-full relative z-20 pt-24 sm:pt-32 pb-32 sm:pb-48 lg:pb-64 px-6 sm:px-12 md:px-16 lg:px-24 bg-[#f4f1e2]">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-20 xl:gap-28">
            
            {/* Esquerda: Imagem */}
            <div className="w-full lg:w-[48%] relative hidden-scrollbar">
              <div className="relative w-full h-[420px] sm:h-[520px] lg:h-[680px] xl:h-[740px] rounded-sm overflow-hidden bg-gradient-to-br from-[#dcebe5] to-[#c6ddd3]">
                <img src="/Dra..png" alt="Dra. Claudia Miranda" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>

            {/* Direita: Conteúdo */}
            <div className="w-full lg:w-[52%] flex flex-col">
              <span className="text-xs tracking-[0.25em] uppercase font-manrope font-semibold text-[#b7995a] block mb-8">
                A CHANCELA POR TRÁS DA MARCA
              </span>
              
              <h2 
                className="text-[clamp(3.96rem,9vw,8.28rem)] font-hello-branch-regular font-normal leading-[0.75] tracking-tight text-[#00563F] mb-12"
                style={{ 
                  fontFamily: "'Hello Branch Regular', 'Hello Branch', 'Cormorant Garamond', 'Playfair Display', serif"
                }}
              >
                Uma marca<br />
                aprovada por<br />
                um olhar<br />
                criterioso.
              </h2>
              
              <div className="text-[15px] sm:text-[16px] xl:text-[17px] text-[#00563F]/85 font-manrope font-light leading-relaxed max-w-xl flex flex-col gap-6">
                <p>
                  A ELIMERA® conta com a aprovação da Dra. Claudia Miranda, que reconhece na marca uma proposta alinhada à beleza, ao cuidado e à sofisticação.
                </p>
                <p>
                  Sua presença reforça o compromisso da ELIMERA® com uma experiência de autocuidado mais elegante, consciente e criteriosa.
                </p>
                <p>
                  A marca valoriza escolhas bem pensadas, atenção aos detalhes e uma relação mais refinada com a beleza individual.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- SEÇÃO NOVO BANNER MANIFESTO INSTITUCIONAL --- */}
      <section className="relative w-full z-20 py-24 sm:py-32 px-6 sm:px-12 md:px-16 lg:px-24 bg-[#003829] min-h-[520px] lg:min-h-[600px] flex items-center justify-center overflow-hidden">
        
        {/* IMAGEM DE FUNDO DO BANNER DE MANIFESTO */}
        <div className="absolute inset-0 w-full h-full z-0">
          <img 
            src="/fundo-banner-04.png" 
            alt="Manifesto Background" 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
          />
          {/* Preenchimento preto com 20% de opacidade */}
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Conteúdo Centralizado */}
        <div className="relative z-10 max-w-4xl mx-auto w-full text-center flex flex-col items-center">
          
          <div className="flex flex-col items-center gap-6 sm:gap-8">
            {/* Eyebrow */}
            <span className="text-xs tracking-[0.3em] uppercase font-manrope font-semibold text-[#b7995a]">
              MANIFESTO
            </span>

            {/* Título Serifado Grande e Impactante */}
            <h2 
              className="text-[clamp(3.96rem,9vw,8.28rem)] font-hello-branch-regular font-normal leading-[0.75] tracking-tight text-[#f4f1e2]"
              style={{ 
                fontFamily: "'Hello Branch Regular', 'Hello Branch', 'Cormorant Garamond', 'Playfair Display', serif"
              }}
            >
              A verdadeira beleza<br />se revela.
            </h2>

            {/* Texto Descritivo */}
            <p className="text-[15px] sm:text-[17px] text-[#f4f1e2]/85 font-manrope font-light leading-relaxed max-w-2xl text-center">
              Ela nasce da essência. É cultivada no cuidado. Ganha forma quando ciência, sensibilidade e propósito se encontram. ELIMERA® — a beleza que se revela em você.
            </p>

          </div>

        </div>
      </section>

      {/* --- SEÇÃO POLÍTICAS DA MARCA --- */}
      <section id="politicas-section" className="w-full relative z-20 py-32 sm:py-40 md:py-48 px-6 sm:px-12 md:px-16 lg:px-24 bg-[#f4f1e2] border-t border-[#00563F]/5">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 lg:items-start">
            
            {/* Coluna Esquerda (45%) */}
            <div className="lg:col-span-5 flex flex-col">
              <span className="text-xs tracking-[0.25em] uppercase font-manrope font-semibold text-[#b7995a] block mb-6">
                COMPRA COM SEGURANÇA
              </span>
              
              <h2 
                className="text-[clamp(3.96rem,9vw,8.28rem)] font-hello-branch-regular font-normal leading-[0.75] tracking-tight text-[#00563F] mb-10"
                style={{ 
                  fontFamily: "'Hello Branch Regular', 'Hello Branch', 'Cormorant Garamond', 'Playfair Display', serif"
                }}
              >
                Políticas<br />
                da marca
              </h2>
              
              <p className="text-[15px] sm:text-[16px] xl:text-[17px] text-[#00563F]/85 font-manrope font-light leading-relaxed max-w-md">
                Seções essenciais para transmitir confiança na página de vendas, com linguagem clara, objetiva e alinhada à experiência premium da ELIMERA®.
              </p>
            </div>

            {/* Coluna Direita (55%) */}
            <div className="lg:col-span-7 flex flex-col gap-8 sm:gap-10">
              {[
                {
                  title: "Frete",
                  text: "Enviamos para todo o Brasil. O prazo e o valor do frete são calculados no momento da compra, conforme CEP, modalidade de envio e disponibilidade logística.",
                  icon: Truck,
                },
                {
                  title: "Troca e devolução",
                  text: "Solicitações devem ser feitas pelos canais oficiais. Para compras online, a desistência pode ser solicitada em até 7 dias corridos após o recebimento, conforme legislação vigente.",
                  icon: RefreshCw,
                },
                {
                  title: "Proteção de dados",
                  text: "Os dados pessoais são tratados com responsabilidade para processar pedidos, realizar entregas, prestar atendimento e melhorar a experiência do cliente.",
                  icon: ShieldCheck,
                },
              ].map((item, idx) => {
                const IconComponent = item.icon;
                const isActive = activePolicy === idx;
                
                return (
                  <div 
                    key={idx}
                    onMouseEnter={() => setActivePolicy(idx)}
                    className="relative flex items-center cursor-pointer group select-none pl-8 sm:pl-10"
                  >
                    {/* Barra vertical fina à esquerda */}
                    <div 
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-[115%] rounded-sm transition-colors duration-500 ease-out ${
                        isActive ? "bg-[#b7995a]" : "bg-[#e3e4e8]"
                      }`} 
                    />

                    {/* Conteúdo do tópico: ícone e textos */}
                    <div className="flex items-center gap-5 sm:gap-6 flex-1">
                      {/* Ícone dentro de um quadrado pequeno */}
                      <div 
                        className={`flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-sm border transition-all duration-500 ease-out shrink-0 ${
                          isActive 
                            ? "bg-[#abd2ab] border-[#abd2ab] text-[#00563F]" 
                            : "bg-transparent border-[#e3e4e8] text-[#00563F]/50"
                        }`}
                      >
                        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-500 group-hover:scale-110" />
                      </div>

                      {/* Conteúdo: Título e Descrição */}
                      <div className="flex-1">
                        <h3 
                          className={`text-lg sm:text-xl font-manrope font-semibold mb-1.5 sm:mb-2 transition-colors duration-500 ease-out ${
                            isActive ? "text-[#00563F]" : "text-[#00563F]/75"
                          }`}
                        >
                          {item.title}
                        </h3>
                        <p className="text-[14px] sm:text-[15px] text-[#2d5642]/85 font-manrope font-light leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* --- FOOTER / MARGIN DETAILS (Extremely clean, modern design details) --- */}
      <footer id="footer" className="relative z-20 border-t border-white/5 pt-24 pb-0 bg-[#003829] text-[#f4f1e2] px-6 sm:px-12 md:px-16 lg:px-24">
        <div className="max-w-7xl mx-auto w-full">
          
          {/* Sessão Superior do Footer: Informações e Links */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 sm:gap-16 pb-20 border-b border-white/10 items-start">
            
            {/* Coluna de Descrição e Redes Sociais */}
            <div className="md:col-span-8 flex flex-col gap-6">
              <img 
                src="/elimera lettering@4x.png" 
                alt="ELIMERA Logo" 
                className="h-16 w-auto object-contain self-start cursor-pointer" 
                onClick={handleLogoClick}
                referrerPolicy="no-referrer"
              />
              <p className="text-[14px] sm:text-[15px] text-[#f4f1e2]/75 font-manrope font-light leading-relaxed max-w-md">
                Sempre abertos a conectar e inspirar — sinta-se em casa para conhecer nossa essência cosmética, explorar nossas formulações científicas e elevar o seu ritual diário de autocuidado.
              </p>
              
              {/* Ícones de Redes Sociais */}
              <div className="flex items-center gap-4 mt-2">
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center w-10 h-10 rounded-full border border-white/15 text-white/70 hover:bg-gradient-to-tr hover:from-[#f58529] hover:via-[#dd2a7b] hover:to-[#8134af] hover:border-transparent hover:text-white transition-all duration-300"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center w-10 h-10 rounded-full border border-white/15 text-white/70 hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white transition-all duration-300"
                  aria-label="Facebook"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a 
                  href="https://wa.me" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center w-10 h-10 rounded-full border border-white/15 text-white/70 hover:bg-[#25D366] hover:border-[#25D366] hover:text-white transition-all duration-300"
                  aria-label="WhatsApp"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.8.983 3.834 1.502 5.913 1.503h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Coluna de Navegação (Menu Principal) */}
            <div className="md:col-span-4 flex flex-col md:items-end gap-5">
              <span className="text-xs tracking-[0.25em] uppercase font-manrope font-semibold text-[#b7995a] md:text-right">
                EXPLORE
              </span>
              <ul className="flex flex-col gap-3 md:items-end text-left md:text-right">
                {menuItems.map((item) => (
                  <li key={item}>
                    <button 
                      onClick={() => handleNavClick(item)}
                      className="text-sm font-manrope font-light text-[#f4f1e2]/75 hover:text-white hover:pl-1.5 transition-all duration-300"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Sessão Intermediária: Direitos Autorais & Créditos */}
          <div className="flex flex-col sm:flex-row justify-between items-center py-8 text-xs tracking-wider text-[#f4f1e2]/40 gap-4">
            <div className="flex items-center gap-1.5 uppercase font-manrope">
              <span>© 2026 ELIMERA. TODOS OS DIREITOS RESERVADOS.</span>
            </div>
            <div>
              <span className="uppercase font-manrope">DESENVOLVIDO POR GAIDEN DESIGN</span>
            </div>
          </div>

          {/* Sessão Inferior: Lettering Gigante full-bleed */}
          <div className="w-full pt-4 md:pt-6 pb-0 overflow-visible flex justify-center items-end select-none">
            <img 
              src="/elimera lettering@4x.png" 
              alt="ELIMERA LETTERING" 
              className="w-full max-w-[1400px] h-auto object-contain select-none pointer-events-none opacity-95 hover:opacity-100 transition-all duration-700 transform -translate-y-[20%] mb-[-8%]" 
              style={{
                maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0) 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0) 100%)"
              }}
              referrerPolicy="no-referrer"
            />
          </div>

        </div>
      </footer>

      {/* --- MODAL DETALHADO INTERATIVO DE COMPONENTES DE MARCA / PRODUTOS --- */}
      <AnimatePresence>
        {/* --- GAVETA DO CARRINHO DE COMPRAS (Cart Drawer Slide-Over) --- */}
        {isCartOpen && (
          <motion.div
            key="cart-drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end"
            onClick={() => setIsCartOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-[#003829] text-[#f4f1e2] h-full shadow-2xl flex flex-col relative z-10 border-l border-[#b7995a]/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#002b1f]">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5 text-[#b7995a]" />
                  <h3 className="font-manrope font-semibold text-lg uppercase tracking-wider text-[#f4f1e2]">
                    Seu Carrinho
                  </h3>
                  {totalItemsCount > 0 && (
                    <span className="bg-[#b7995a] text-[#1b3b2c] text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {totalItemsCount} {totalItemsCount === 1 ? "item" : "itens"}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10"
                  aria-label="Fechar carrinho"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Content / Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-[#f4f1e2]/70 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-[#b7995a]">
                      <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                    </div>
                    <p className="font-manrope font-light text-base text-white/90">
                      Seu carrinho está vazio.
                    </p>
                    <p className="text-xs text-white/60 max-w-xs">
                      Explore nossos produtos e descubra o cuidado essencial para sua pele.
                    </p>
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        const section = document.getElementById("produtos-section");
                        if (section) section.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="mt-4 rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-widest bg-[#b7995a] text-[#1b3b2c] hover:bg-[#caad6e] transition-all duration-300"
                    >
                      Ver produtos
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex gap-4 p-4 rounded-lg bg-white/5 border border-white/10 relative group"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-20 h-24 object-cover rounded-md bg-[#edf0eb] shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[9px] font-bold text-[#b7995a] uppercase tracking-widest block">
                                {item.product.category}
                              </span>
                              <h4 className="font-manrope font-semibold text-base text-white">
                                {item.product.name}
                              </h4>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-white/40 hover:text-red-400 transition-colors p-1"
                              aria-label="Remover item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-white/70 mt-0.5 line-clamp-1">
                            {item.product.subtitle}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10">
                          {/* Quantity Selector */}
                          <div className="flex items-center border border-white/20 rounded-full px-2 py-1 bg-black/20">
                            <button
                              onClick={() => updateCartQuantity(item.product.id, -1)}
                              className="text-white/80 hover:text-[#b7995a] transition-colors p-0.5"
                              aria-label="Diminuir quantidade"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-7 text-center text-xs font-bold text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(item.product.id, 1)}
                              className="text-white/80 hover:text-[#b7995a] transition-colors p-0.5"
                              aria-label="Aumentar quantidade"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Item Price Total */}
                          <span className="font-manrope font-semibold text-sm text-[#b7995a]">
                            R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer / Checkout CTA */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-white/10 bg-[#002b1f] flex flex-col gap-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/70 font-manrope">Subtotal</span>
                    <span className="text-xl font-bold font-manrope text-white">
                      R$ {cartSubtotal.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <p className="text-[11px] text-white/60 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#b7995a]" />
                    Frete e descontos calculados com segurança no checkout.
                  </p>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCheckout}
                    className="w-full py-4 rounded-full bg-[#b7995a] text-[#1b3b2c] font-bold text-xs uppercase tracking-widest shadow-xl hover:bg-[#caad6e] transition-all flex items-center justify-center gap-2"
                  >
                    <span>Finalizar Compra</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>

                  <div className="flex justify-center items-center gap-4 pt-1 text-[10px] text-white/40 uppercase tracking-wider">
                    <span>Checkout Seguro Yampi</span>
                    <span>•</span>
                    <span>Pagamento PIX / Cartão</span>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {activeOverlay === "product_detail" && selectedProduct && (
          <motion.div
            key="overlay-product-detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-[#2d5642] border border-[#b7995a]/30 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative shadow-2xl"
            >
              <button
                onClick={() => setActiveOverlay(null)}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors bg-black/20 p-2 rounded-full backdrop-blur-sm z-10"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-full md:w-1/2 h-[30vh] md:h-auto relative bg-[#edf0eb]">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto bg-[#f4f1e2] text-[#00563F]">
                <span className="text-[10px] sm:text-xs tracking-[0.25em] uppercase font-manrope font-semibold text-[#b7995a] block mb-4">
                  {selectedProduct.category}
                </span>
                <h2 
                  className="text-3xl sm:text-4xl font-manrope font-semibold mb-6"
                >
                  {selectedProduct.name}
                </h2>
                <div className="text-sm sm:text-[15px] font-manrope font-light text-[#2d5642]/90 leading-relaxed space-y-6">
                  <p>{selectedProduct.description}</p>
                  
                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-semibold text-[#b7995a] mb-3">Benefícios Principais</h4>
                    <ul className="space-y-2 list-none">
                      {selectedProduct.benefits.map((benefit, idx) => (
                         <li key={idx} className="flex items-start gap-2">
                           <span className="text-[#b7995a] mt-0.5">·</span> {benefit}
                         </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-10">
                  <motion.button 
                    whileTap={{ scale: 0.98 }}
                    className="w-full rounded-full py-4 text-xs font-bold uppercase tracking-widest bg-transparent text-[#b7995a] border border-[#b7995a] hover:bg-[#b7995a] hover:text-white transition-all duration-300 focus:outline-none"
                    onClick={() => alert(`Você colocou o ${selectedProduct.name} no carrinho!`)}
                  >
                    Comprar agora
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeOverlay === "origem" && (
          <motion.div
            key="overlay-origem"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-[#2d5642] border border-[#b7995a]/30 rounded-3xl p-8 max-w-2xl w-full relative shadow-2xl"
            >
              <button
                onClick={() => setActiveOverlay(null)}
                className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"
                aria-label="Fechar"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-2 text-[#b7995a]">
                  <BookOpen className="w-5 h-5" />
                  <span className="text-xs uppercase tracking-widest font-manrope">Manifesto de Origem</span>
                </div>
                
                <h2 className="text-3xl font-hello-branch-regular text-white">Criar com Significado</h2>
                
                <p className="text-sm sm:text-base text-white/90 font-manrope leading-relaxed">
                  A ELIMERA® nasceu nos laboratórios de cosmetologia avançada com uma premissa simples, mas profunda: a rotina de cuidados não deve ser um ato mecânico de vaidade, mas sim um santuário diário de atenção plena.
                </p>

                <p className="text-sm sm:text-base text-white/90 font-manrope leading-relaxed">
                  Desenvolvemos formulações limpas, combinando sementes nativas brasileiras colhidas de forma sustentável com compostos de alta eficácia sintética produzidos em condições de rigores científicos absolutos. A ciência cosmética nos permite garantir estabilidade e potência máximas, enquanto a essência sensorial ativa o toque e a presença no agora.
                </p>

                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="bg-[#244535] rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-1.5 text-[#b7995a] text-xs font-semibold uppercase tracking-wider mb-1">
                      <Clock className="w-4 h-4" />
                      <span>Resultados Clíniicos</span>
                    </div>
                    <p className="text-white font-hello-branch-regular text-2xl">96%</p>
                    <p className="text-[11px] text-white/70 font-manrope">de aumento constatado em hidratação e firmeza epidérmica.</p>
                  </div>

                  <div className="bg-[#244535] rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-1.5 text-[#b7995a] text-xs font-semibold uppercase tracking-wider mb-1">
                      <Sparkles className="w-4 h-4" />
                      <span>Ingredientes Ativos</span>
                    </div>
                    <p className="text-white font-hello-branch-regular text-2xl">Livre</p>
                    <p className="text-[11px] text-white/70 font-manrope">de parabenos, silicones pesados, corantes artificiais e crueldade animal.</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => setActiveOverlay(null)}
                    className="rounded-full px-6 py-2.5 text-xs uppercase tracking-widest bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
                  >
                    Voltar ao Início
                  </button>
                  <button
                    onClick={() => {
                      setActiveOverlay(null);
                      setTimeout(() => {
                        const section = document.getElementById("produtos-section");
                        if (section) section.scrollIntoView({ behavior: "smooth" });
                      }, 100);
                    }}
                    className="rounded-full px-6 py-2.5 text-xs uppercase tracking-widest bg-[#b7995a] hover:bg-[#caad6e] text-white font-bold transition-colors"
                  >
                    Ver Linha de Produtos
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
