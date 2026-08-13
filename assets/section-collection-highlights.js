if (!customElements.get("collection-hover")) {
  customElements.define(
    "collection-hover",
    class CollectionHover extends HTMLElement {
      constructor() {
        super();
        this.content = this.querySelector(".collection-list__content");
        this.imageHover = this.querySelector(".collection-list__image-hover");
        this.mousePosition = { x: 0, y: 0 };
        this.isHovering = false;
        this.bounds = null;
        this.imageVisible = false;
        this.animationId = null;
        this.cursorOffset = { x: 10, y: 10 };
        this.isLargeScreen = window.matchMedia("(min-width: 1025px)").matches;
      }

      connectedCallback() {
        if (!this.content || !this.imageHover) return;

        if (this.isLargeScreen) {
          this.setupImageStyles();
          this.addEventListeners();
          this.updateImageSize();
        }

        const image = this.imageHover.querySelector("img");
        if (image && !image.complete) {
          image.addEventListener("load", () => {
            if (this.isLargeScreen) {
              this.updateImageSize();
            }
          });
        }

        window
          .matchMedia("(min-width: 1025px)")
          .addEventListener("change", this.handleMediaChange.bind(this));
      }

      handleMediaChange(e) {
        this.isLargeScreen = e.matches;
        if (this.isLargeScreen) {
          this.setupImageStyles();
          this.addEventListeners();
          this.updateImageSize();
        } else {
          this.onMouseLeave(); 
          this.removeEventListeners();
          this.clearImageStyles(); 
        }
      }

      addEventListeners() {
        if (!this.content) return;
        this.content.addEventListener(
          "mouseenter",
          this.onMouseEnter.bind(this)
        );
        this.content.addEventListener(
          "mouseleave",
          this.onMouseLeave.bind(this)
        );
        this.content.addEventListener("mousemove", this.onMouseMove.bind(this));
      }

      removeEventListeners() {
        if (!this.content) return;
        this.content.removeEventListener("mouseenter", this.onMouseEnter);
        this.content.removeEventListener("mouseleave", this.onMouseLeave);
        this.content.removeEventListener("mousemove", this.onMouseMove);
      }

      setupImageStyles() {
        if (!this.imageHover) return;

        this.imageHover.style.position = "fixed";
        this.imageHover.style.pointerEvents = "none";
        this.imageHover.style.zIndex = "100";
        this.imageHover.style.opacity = "0";
        this.imageHover.style.overflow = "hidden";
        this.imageHover.style.left = "-9999px";
        this.imageHover.style.top = "-9999px";
        this.imageHover.style.transition = "none";
      }

      clearImageStyles() {
        if (!this.imageHover) return;

        this.imageHover.style.position = "";
        this.imageHover.style.pointerEvents = "";
        this.imageHover.style.zIndex = "";
        this.imageHover.style.opacity = "";
        this.imageHover.style.overflow = "";
        this.imageHover.style.left = "";
        this.imageHover.style.top = "";
        this.imageHover.style.transition = "";
        this.imageHover.style.width = "";
        this.imageHover.style.height = "";
        this.imageHover.style.maxHeight = "";
      }

      updateImageSize() {
        if (!this.isLargeScreen) return;

        const maxHeight = Math.min(300, window.innerHeight * 0.5);
        this.imageHover.style.width = `120px`;
        this.imageHover.style.height = "auto";
        this.imageHover.style.maxHeight = `${maxHeight}px`;
      }

      onMouseEnter(event) {
        if (!this.isLargeScreen) return;
        this.isHovering = true;
        this.bounds = this.content.getBoundingClientRect();

        this.updateMousePosition(event);

        if (!this.imageVisible && this.imageHover) {
          this.positionImageAtCursor();
          this.imageVisible = true;

          if (typeof Motion !== "undefined") {
            Motion.animate(
              this.imageHover,
              {
                opacity: [0, 1],
                scale: [0.7, 1],
              },
              {
                duration: 0.3,
                easing: "cubic-bezier(0.25, 0.1, 0.25, 1)",
              }
            );
          }

          this.animateImagePosition();
        }
      }

      positionImageAtCursor() {
        if (!this.mousePosition || !this.bounds) return;

        const x = this.mousePosition.x + this.cursorOffset.x;
        const y = this.mousePosition.y + this.cursorOffset.y;

        const centerX = this.bounds.left + this.bounds.width / 2;
        const centerY = this.bounds.top + this.bounds.height / 2;

        const pullFactor = 0.1;
        const finalX = x + (centerX - x) * pullFactor;
        const finalY = y + (centerY - y) * pullFactor;

        this.imageHover.style.left = `${finalX}px`;
        this.imageHover.style.top = `${finalY}px`;
      }

      onMouseLeave() {
        this.isHovering = false;

        if (this.imageVisible && this.imageHover) {
          this.imageVisible = false;

          if (typeof Motion !== "undefined") {
            Motion.animate(
              this.imageHover,
              {
                opacity: [1, 0],
                scale: [1, 0.7],
              },
              {
                duration: 0.3,
                easing: "cubic-bezier(0.25, 0.1, 0.25, 1)",
              }
            );
          }

          if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
          }

          setTimeout(() => {
            if (!this.isHovering && this.imageHover) {
              this.imageHover.style.left = "-9999px";
              this.imageHover.style.top = "-9999px";
            }
          }, 300);
        }
      }

      onMouseMove(event) {
        if (this.isHovering && this.isLargeScreen) {
          this.updateMousePosition(event);
        }
      }

      updateMousePosition(event) {
        this.mousePosition = {
          x: event.clientX,
          y: event.clientY,
        };
      }

      animateImagePosition() {
        if (!this.isHovering || !this.imageVisible || !this.isLargeScreen) {
          return;
        }

        const x = this.mousePosition.x + this.cursorOffset.x;
        const y = this.mousePosition.y + this.cursorOffset.y;

        const centerX = this.bounds.left + this.bounds.width / 2;
        const centerY = this.bounds.top + this.bounds.height / 2;

        const pullFactor = 0.1;
        const finalX = x + (centerX - x) * pullFactor;
        const finalY = y + (centerY - y) * pullFactor;

        this.imageHover.style.left = `${finalX}px`;
        this.imageHover.style.top = `${finalY}px`;

        const image = this.imageHover.querySelector("img");
        if (image) {
          const relX =
            (this.mousePosition.x - this.bounds.left) / this.bounds.width;
          const relY =
            (this.mousePosition.y - this.bounds.top) / this.bounds.height;

          const moveX = (relX - 0.5) * -6;
          const moveY = (relY - 0.5) * -6;

        }

        this.animationId = requestAnimationFrame(
          this.animateImagePosition.bind(this)
        );
      }

      disconnectedCallback() {
        this.removeEventListeners();
        if (this.animationId) {
          cancelAnimationFrame(this.animationId);
        }
        window
          .matchMedia("(min-width: 1025px)")
          .removeEventListener("change", this.handleMediaChange);
      }
    }
  );
}