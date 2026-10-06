import { Link } from "react-router-dom"

const HeroSection = () => {
  return (
    <>
          {/* <div className="hero bg-base-200 min-h-screen">
              <div className="hero-content flex-col lg:flex-row-reverse">
                  <img
                      alt="Tailwind CSS hero component"
                      src="https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp"
                      className="max-w-sm rounded-lg shadow-2xl"
                  />
                  <div>
                      <h1 className="text-5xl font-bold">Box Office News!</h1>
                      <p className="py-6">
                          Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem
                          quasi. In deleniti eaque aut repudiandae et a id nisi.
                      </p>
                      <button className="btn btn-primary">Get Started</button>
                  </div>
              </div>
          </div> */}

          <section className="hero min-h-[80vh] bg-base-100">
              <div className="hero-content flex-col-reverse gap-10 px-6 lg:flex-row lg:gap-16 max-w-7xl">
                  <div className="max-w-xl text-center lg:text-left">
                      <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                          Sell what you don't need.
                          <br />
                          Buy what you do.
                      </h1>
                      <p className="py-6 text-lg opacity-80">
                          List a product in minutes and chat with buyers and sellers in real time.
                      </p>
                      <div className="flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                          <Link to="/post-product" className="btn btn-primary btn-lg">Start selling</Link>
                          <Link to="/shop" className="btn btn-outline btn-primary btn-lg">Browse products</Link>
                      </div>
                  </div>

                  <img
                      src="/hero-marketplace.png"
                      alt="A product listing next to a live chat between buyer and seller"
                      className="w-full max-w-md lg:max-w-xl"
                  />
              </div>
          </section>
    </>
  )
}

export default HeroSection