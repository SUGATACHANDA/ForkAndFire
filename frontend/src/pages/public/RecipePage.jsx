import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import YouTube from "react-youtube";
import API from "../../api/index";
import { useAuth } from "../../hooks/useAuth";
import FaqAccordion from "../../components/recipe/FaqAccordion";
import Loader from "../../components/common/Loader";
import RelatedRecipes from "../../components/recipe/RelatedRecipes";
import CommentSection from "../../components/recipe/CommentSection";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faUtensils,
  faHeart as faHeartSolid,
  faBookmark,
  faCommentDots,
  faPrint,
  // faLink,
  faTimes,
  faEnvelope,
  faShare,
} from "@fortawesome/free-solid-svg-icons";
import {
  faWhatsapp,
  faFacebook,
  faXTwitter,
  // faLinkedin,
  faPinterest,
  faFlipboard,
} from "@fortawesome/free-brands-svg-icons";
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Preloader from "../../components/layout/Preloader";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

gsap.registerPlugin(ScrollTrigger);

const getYouTubeId = (url) => {
  if (!url || typeof url !== "string") return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const RecipePage = () => {
  // === Hooks ===
  const { id } = useParams();
  const location = useLocation();
  const { userInfo, favorites, toggleFavorite } = useAuth();

  // === State Management ===
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [localFavoriteCount, setLocalFavoriteCount] = useState(0);
  const mainRef = useRef(null);
  const isFavorite = userInfo ? favorites.includes(id) : false;

  const [isShareOpen, setIsShareOpen] = useState(false);

  // === Data Fetching Effect ===
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const fetchRecipe = async () => {
      setLoading(true);
      setError(null);
      try {
        window.scrollTo(0, 0);
        const { data } = await API.get(`/api/recipes/${id}`, { signal });
        setRecipe(data);
        setLocalFavoriteCount(data.favoriteCount || 0);
      } catch (err) {
        if (err.name !== "CanceledError") {
          setError(
            "Could not load this recipe. It may have been removed or the URL is incorrect."
          );
        }
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    };
    fetchRecipe();
    return () => controller.abort();
  }, [id]);

  // === Animation Effect ===
  useEffect(() => {
    if (!loading && recipe) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".anim-on-load",
          { y: 30, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            stagger: 0.1,
            duration: 0.8,
            ease: "power3.out",
            delay: 0.2,
          }
        );
        gsap.utils.toArray(".anim-on-scroll").forEach((element) => {
          gsap.fromTo(
            element,
            { y: 50, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: { trigger: element, start: "top 85%" },
            }
          );
        });
      }, mainRef);
      return () => ctx.revert();
    }
  }, [loading, recipe]);

  // === Event Handlers ===
  const handleToggleFavorite = async () => {
    setLocalFavoriteCount((prev) =>
      isFavorite ? Math.max(0, prev - 1) : prev + 1
    );
    setIsTogglingFavorite(true);
    await toggleFavorite(id);
    setIsTogglingFavorite(false);
  };

  const onPlayerReady = (event) => {
    const iframe = event.target.getIframe();
    iframe.style.position = "absolute";
    iframe.style.top = "0";
    iframe.style.left = "0";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
  };
  // --- Render Logic ---
  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Preloader />
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-center text-red-500 bg-red-50 p-8">
        {error}
      </div>
    );
  if (!recipe)
    return (
      <div className="min-h-screen flex items-center justify-center text-center text-secondary-text">
        Recipe not found.
      </div>
    );

  const {
    title,
    category,
    author,
    prepTime,
    cookTime,
    servings,
    description,
    ingredients,
    steps,
    faqs,
    mainImage,
    youtubeUrl,
    commentCount,
  } = recipe;
  const imageUrl = mainImage;
  const videoId = getYouTubeId(youtubeUrl);

  const shareUrl = window.location.href;
  // const encodedTitle = encodeURIComponent(
  //   `${title} - Check out this recipe on Fork & Fire!`
  // );

  document.title = `${title} - Fork & Fire`;

  return (
    <div ref={mainRef} className="max-w-7xl mx-auto py-16 px-4 md:px-8">
      <header className="text-center mb-12 anim-on-load">
        <p className="font-bold uppercase tracking-widest text-accent">
          {category?.name || "Uncategorized"}
        </p>
        <h1 className="text-4xl md:text-6xl font-serif font-bold my-4 text-primary-text">
          {title || "Untitled Recipe"}
        </h1>
        <p className="text-lg text-secondary-text">
          By{" "}
          <span className="font-semibold text-primary-text">
            {author?.name || "Anonymous"}
          </span>
        </p>
      </header>

      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          className="anim-on-load w-full h-[60vh] object-cover rounded-2xl shadow-xl mb-12"
        />
      )}

      <div className="anim-on-load flex flex-wrap justify-center items-center gap-x-8 gap-y-4 bg-accent-light p-6 rounded-xl mb-12 text-center text-primary-text">
        <div className="flex items-center gap-3">
          <FontAwesomeIcon icon={faClock} className="text-accent text-2xl" />
          <div>
            <h3 className="font-bold text-sm uppercase">Prep Time</h3>
            <p>{prepTime || "N/A"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <FontAwesomeIcon icon={faClock} className="text-accent text-2xl" />
          <div>
            <h3 className="font-bold text-sm uppercase">Cook Time</h3>
            <p>{cookTime || "N/A"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <FontAwesomeIcon icon={faUtensils} className="text-accent text-2xl" />
          <div>
            <h3 className="font-bold text-sm uppercase">Servings</h3>
            <p>{servings || "N/A"}</p>
          </div>
        </div>
        <ScrollLink
          to="comment-section"
          spy={true}
          smooth={true}
          offset={-100}
          duration={800}
          className="flex items-center gap-3 cursor-pointer"
        >
          <FontAwesomeIcon
            icon={faCommentDots}
            className="text-accent text-2xl"
          />
          <div>
            <h3 className="font-bold text-sm uppercase">Discussion</h3>
            <p>{commentCount || 0}</p>
          </div>
        </ScrollLink>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-8">
        <aside className="lg:col-span-1 lg:order-last">
          <div className="anim-on-scroll bg-white p-8 rounded-lg shadow-md sticky top-28">
            <h2 className="text-3xl font-serif mb-4 text-primary-text">
              Ingredients
            </h2>
            <ul className="space-y-3 list-disc list-inside text-secondary-text pl-2">
              {ingredients?.map((ing, i) => (
                <li key={i} className="leading-relaxed">
                  {ing}
                </li>
              )) || <li>No ingredients listed.</li>}
            </ul>
            {userInfo ? (
              <button
                onClick={handleToggleFavorite}
                disabled={isTogglingFavorite}
                className="w-full mt-8 bg-accent text-white font-bold py-3 rounded-lg flex items-center justify-center gap-3 hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FontAwesomeIcon
                  icon={isFavorite ? faHeartSolid : faHeartRegular}
                  className="text-xl"
                />
                <span>
                  {isTogglingFavorite
                    ? "Updating..."
                    : isFavorite
                      ? "Saved to Favorites"
                      : "Save to Favorites"}
                </span>
              </button>
            ) : (
              <Link
                to={'/login'}
                state={{ from: location }}
                className="w-full mt-8 bg-accent text-white font-bold py-3 rounded-lg flex items-center justify-center gap-3 hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Login to Save the Recipe
              </Link>
            )}
            <div className="mt-4 text-center text-sm text-secondary-text flex items-center justify-center gap-2">
              <FontAwesomeIcon icon={faBookmark} />
              <span>
                Saved by{" "}
                <span className="font-bold text-primary-text">
                  {localFavoriteCount}
                </span>{" "}
                other food lovers
              </span>
            </div>
            <Link
              to={`/print/recipe/${id}`}
              rel="noopener noreferrer"
              className="w-full mt-4 bg-gray-100 text-primary-text font-semibold py-2.5 px-5 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faPrint} />
              <span>Print Recipe</span>
            </Link>
            <button
              onClick={() => setIsShareOpen(true)}
              className="w-full mt-4 bg-accent text-white font-semibold py-2.5 px-5 rounded-md hover:bg-opacity-90"
            >
              <FontAwesomeIcon icon={faShare} className="mr-2" /> Share Recipe
            </button>
          </div>
        </aside>
        {isShareOpen && (
          <Dialog
            open={isShareOpen}
            onClose={() => setIsShareOpen(false)}
            className="relative z-50"
          >
            <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <DialogPanel className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative">
                <button
                  className="absolute top-3 right-4 text-gray-500 hover:text-gray-800"
                  onClick={() => setIsShareOpen(false)}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
                <DialogTitle className="text-xl font-bold text-center mb-4">
                  Share this Recipe
                </DialogTitle>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `*${title}*\n\nCheck out this delicious recipe from Fork & Fire:\n\n${shareUrl}\n\nPrep Time: ${prepTime || 'N/A'} | Cook Time: ${cookTime || 'N/A'} | Servings: ${servings || 'N/A'}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-green-500"
                  >
                    <FontAwesomeIcon icon={faWhatsapp} size="2x" />
                    <p className="text-sm mt-1">WhatsApp</p>
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(
                      `${title} - A delightful recipe on Fork & Fire.\nPrep Time: ${prepTime || 'N/A'}, Cook Time: ${cookTime || 'N/A'}, Servings: ${servings || 'N/A'}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600"
                  >
                    <FontAwesomeIcon icon={faFacebook} size="2x" />
                    <p className="text-sm mt-1">Facebook</p>
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      `🍲 ${title} from Fork & Fire! Try this recipe with prep time: ${prepTime || 'N/A'}, cook time: ${cookTime || 'N/A'}.\n\n${shareUrl}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-black"
                  >
                    <FontAwesomeIcon icon={faXTwitter} size="2x" />
                    <p className="text-sm mt-1">Twitter</p>
                  </a>
                  {/* <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" rel="noreferrer" className="text-blue-700">
                    <FontAwesomeIcon icon={faLinkedin} size="2x" />
                    <p className="text-sm mt-1">LinkedIn</p>
                  </a> */}
                  <a
                    href={`mailto:?subject=${encodeURIComponent(`Try this recipe: ${title}`)}&body=${encodeURIComponent(
                      `Hi there!\n\nI found this amazing recipe on Fork & Fire and thought you’d enjoy it:\n\n${title}\n\nPrep Time: ${prepTime || 'N/A'}\nCook Time: ${cookTime || 'N/A'}\nServings: ${servings || 'N/A'}\n\nCheck it out here: ${shareUrl}`
                    )}`}
                    target="_blank"
                    className="text-red-500"
                  >
                    <FontAwesomeIcon icon={faEnvelope} size="2x" />
                    <p className="text-sm mt-1">Email</p>
                  </a>
                  <a
                    href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(
                      `${title} – A delicious recipe on Fork & Fire. Try this now!\nPrep: ${prepTime || 'N/A'}, Cook: ${cookTime || 'N/A'}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-red-600"
                  >
                    <FontAwesomeIcon icon={faPinterest} size="2x" />
                    <p className="text-sm mt-1">Pinterest</p>
                  </a>
                  <a
                    href={`https://share.flipboard.com/bookmarklet/popout?v=2&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(
                      `${title} - Fork & Fire`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-red-600"
                  >
                    <FontAwesomeIcon icon={faFlipboard} size="2x" />
                    <p className="text-sm mt-1">Flipboard</p>
                  </a>
                  {/* <button onClick={() => { navigator.clipboard.writeText(shareUrl); alert("Link copied!"); }} className="text-gray-600 hover:text-black">
                    <FontAwesomeIcon icon={faLink} size="2x" />
                    <p className="text-sm mt-1">Copy Link</p>
                  </button> */}
                </div>
              </DialogPanel>
            </div>
          </Dialog>
        )}

        <div className="lg:col-span-2">
          <p className="anim-on-load text-lg text-secondary-text mb-12 leading-loose">
            {description || "No description provided."}
          </p>
          <div>
            <h2 className="anim-on-scroll text-4xl font-serif mb-8 text-primary-text">
              Instructions
            </h2>
            {steps?.map((step, index) => (
              <div
                key={step._id || index}
                className="anim-on-scroll flex flex-col md:flex-row gap-6 mb-10 pb-10 border-b border-gray-200 last:border-b-0"
              >
                <h3 className="text-3xl font-bold font-serif text-accent flex-shrink-0">
                  Step {index + 1}
                </h3>
                <div>
                  {step.image && (
                    <img
                      src={step.image}
                      alt={`Visual for Step ${index + 1}`}
                      className="rounded-lg shadow-md w-full mb-4"
                      loading="lazy"
                    />
                  )}
                  <p className="text-lg leading-relaxed text-primary-text">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {(videoId || (faqs && faqs.length > 0)) && (
        <section className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12">
          {videoId && (
            <div className="anim-on-scroll">
              <h2 className="text-3xl font-serif mb-6 text-primary-text">
                Watch The Tutorial
              </h2>
              <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-xl bg-black">
                <YouTube
                  videoId={videoId}
                  onReady={onPlayerReady}
                  opts={{
                    width: "100%",
                    height: "100%",
                    playerVars: { rel: 0, modestbranding: 1 },
                  }}
                />
              </div>
            </div>
          )}
          {faqs && faqs.length > 0 && (
            <div className="anim-on-scroll">
              <h2 className="text-3xl font-serif mb-6 text-primary-text">
                Frequently Asked Questions
              </h2>
              <div className="space-y-2">
                {faqs.map(
                  (faq) =>
                    faq?._id && (
                      <FaqAccordion
                        key={faq._id}
                        title={faq.question}
                        content={faq.answer}
                      />
                    )
                )}
              </div>
            </div>
          )}
        </section>
      )}

      <div className="mt-16">
        <RelatedRecipes
          categoryId={category?._id}
          currentRecipeId={id}
          key={id}
        />
      </div>

      <div id="comment-section">
        <CommentSection recipeId={id} initialCommentCount={commentCount || 0} />
      </div>
    </div>
  );
};

export default RecipePage;
