import { useRef } from "react";

import HomeCategories from "./HomeCategories.jsx";
import HomeCollections from "./HomeCollections.jsx";
import HomeCustomized from "./HomeCustomized.jsx";
import HomeFeaturedCollection from "./HomeFeaturedCollection.jsx";
import HomeFeedback from "./HomeFeedback.jsx";
import HomeIntro from "./HomeIntro.jsx";
import HomeOpeningSlider from "./HomeOpeningSlider.jsx";
import HomeImageBanner from "./HomeImageBanner.jsx";
import HomeImageText from "./HomeImageText.jsx";

import { ButterflyTransformationHero } from "./ButterflyTransformationHero/ButterflyTransformationHero.jsx";

function TransformationStorySection({ content }) {
  /*
   * IMPORTANT:
   *
   * This ref must remain around BOTH HomeIntro
   * and HomeCustomized.
   *
   * The butterfly animation uses this complete
   * section as its scroll timeline.
   */
  const transformationRef = useRef(null);

  return (
    <>
      <ButterflyTransformationHero sectionRef={transformationRef} />

      <div
        ref={transformationRef}
        className="relative"
        data-transformation-story
      >
        <HomeIntro content={content?.intro} />

        <HomeCustomized content={content?.customized} />
      </div>
    </>
  );
}

function HomeSectionRenderer({ section }) {
  if (!section) {
    return null;
  }

  switch (section.type) {
    case "OPENING_SLIDER":
      return <HomeOpeningSlider content={section.content} />;

    case "TRANSFORMATION_STORY":
      return <TransformationStorySection content={section.content} />;

    case "CATEGORIES":
      return <HomeCategories content={section.content} />;

    case "FEATURED_PRODUCTS":
      return <HomeFeaturedCollection content={section.content} />;

    case "COLLECTIONS":
      return <HomeCollections content={section.content} />;

    case "FEEDBACK":
      return <HomeFeedback content={section.content} />;

    /*
     * ANNOUNCEMENT_BAR is deliberately not
     * rendered here.
     *
     * It belongs to CustomerLayout above the
     * header and already reads the same public
     * HomeSection data.
     */
    case "ANNOUNCEMENT_BAR":
      return null;

    /*
     * We have not built these flexible section
     * types yet.
     */
    case "IMAGE_TEXT":
      return <HomeImageText content={section.content} />;

    case "IMAGE_BANNER":
      return <HomeImageBanner content={section.content} />;
    default:
      if (import.meta.env.DEV) {
        console.warn(`Unknown homepage section type: ${section.type}`);
      }

      return null;
  }
}

export default HomeSectionRenderer;
