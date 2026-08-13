import { initSlide, SlideSection } from "@NextSkyTheme/slide";

class ReviewSlide extends SlideSection {
  connectedCallback() {
    this.initFrame = requestAnimationFrame(() => {
      this.initFrame = null;
      if (!this.swiper || this.swiper.destroyed) {
        super.init();
      }

      this.initMedia();
    });
  }

  disconnectedCallback() {
    if (this.initFrame != null) {
      cancelAnimationFrame(this.initFrame);
      this.initFrame = null;
    }

    if (this.swiper && !this.swiper.destroyed && this.onContentSlideChange) {
      this.swiper.off("slideChange", this.onContentSlideChange);
    }

    if (
      this.mediaSwiper &&
      !this.mediaSwiper.destroyed &&
      this.onMediaSlideChange
    ) {
      this.mediaSwiper.off("slideChange", this.onMediaSlideChange);
    }

    if (this.mediaSwiper && !this.mediaSwiper.destroyed) {
      this.mediaSwiper.destroy(true, true);
    }

    if (this.swiper && !this.swiper.destroyed) {
      this.swiper.destroy(true, true);
    }

    this.swiper = null;
    this.mediaSwiper = null;
    this.onContentSlideChange = null;
    this.onMediaSlideChange = null;
  }

  initMedia() {
    if (this.mediaSwiper || !this.swiper) return;

    const section = this.closest("[data-review-section]");
    const media = section?.querySelector("[data-review-media]");
    if (!media) return;

    this.mediaSwiper =
      media.swiper && !media.swiper.destroyed ? media.swiper : initSlide(media);
    this.syncSlides();
  }

  syncSlides() {
    this.onContentSlideChange = () => {
      if (this.isSyncing) return;
      this.goToSlide(this.mediaSwiper, this.swiper.realIndex);
    };

    this.onMediaSlideChange = () => {
      if (this.isSyncing) return;
      this.goToSlide(this.swiper, this.mediaSwiper.realIndex);
    };

    this.swiper.on("slideChange", this.onContentSlideChange);
    this.mediaSwiper.on("slideChange", this.onMediaSlideChange);

    this.goToSlide(this.mediaSwiper, this.swiper.realIndex);
  }

  goToSlide(swiper, index) {
    if (!swiper || swiper.destroyed || swiper.realIndex === index) return;
    this.isSyncing = true;

    try {
      swiper.slideTo(index);
    } finally {
      this.isSyncing = false;
    }
  }
}

if (!customElements.get("review-slide")) {
  customElements.define("review-slide", ReviewSlide);
}
