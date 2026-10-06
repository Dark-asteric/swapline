import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const FALLBACK = "/favicon.svg";

const ProductGallery = ({ images = [], alt = "Product" }) => {
    const list = images.filter(Boolean);
    const slides = list.length ? list : [FALLBACK];
    const count = slides.length;

    const [index, setIndex] = useState(0);
    const touchX = useRef(null);
    const current = Math.min(index, count - 1);

    const go = (i) => setIndex((i + count) % count);
    const prev = () => go(current - 1);
    const next = () => go(current + 1);

    const onTouchEnd = (e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) < 50) return;
        if (dx < 0) next();
        else prev();
    };

    const onKeyDown = (e) => {
        if (e.key === "ArrowLeft") prev();
        if (e.key === "ArrowRight") next();
    };

    const handleError = (e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = FALLBACK;
    };

    return (
        <div>
            <div
                className="relative overflow-hidden rounded-2xl bg-base-200 aspect-square outline-none"
                tabIndex={0}
                role="region"
                aria-roledescription="carousel"
                aria-label={`${alt} photos`}
                onKeyDown={onKeyDown}
                onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
                onTouchEnd={onTouchEnd}
            >
                <div
                    className="flex h-full transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${current * 100}%)` }}
                >
                    {slides.map((src, i) => (
                        <img
                            key={`${src}-${i}`}
                            src={src}
                            alt={`${alt} ${i + 1} of ${count}`}
                            draggable={false}
                            loading={i === 0 ? "eager" : "lazy"}
                            onError={handleError}
                            className="w-full h-full object-cover shrink-0 select-none"
                        />
                    ))}
                </div>

                {count > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={prev}
                            aria-label="Previous photo"
                            className="btn btn-circle btn-sm bg-base-100/80 border-0 shadow absolute left-3 top-1/2 -translate-y-1/2"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={next}
                            aria-label="Next photo"
                            className="btn btn-circle btn-sm bg-base-100/80 border-0 shadow absolute right-3 top-1/2 -translate-y-1/2"
                        >
                            <ChevronRight size={18} />
                        </button>

                        <span className="badge badge-neutral absolute top-3 right-3">
                            {current + 1} / {count}
                        </span>

                        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                            {slides.map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => go(i)}
                                    aria-label={`Go to photo ${i + 1}`}
                                    className={`h-2 rounded-full shadow transition-all ${i === current ? "w-6 bg-white" : "w-2 bg-white/60"
                                        }`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {count > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                    {slides.map((src, i) => (
                        <button
                            key={`${src}-${i}`}
                            type="button"
                            onClick={() => go(i)}
                            aria-label={`Show photo ${i + 1}`}
                            className={`shrink-0 rounded-lg overflow-hidden border-2 ${i === current ? "border-primary" : "border-transparent opacity-70"
                                }`}
                        >
                            <img
                                src={src}
                                alt=""
                                onError={handleError}
                                className="w-20 h-20 object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductGallery;