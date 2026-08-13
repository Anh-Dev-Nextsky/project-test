import { SlideSection } from "@NextSkyTheme/slide";
import { LazyLoader } from "@NextSkyTheme/lazy-load";
import * as NextSkyTheme from "@NextSkyTheme/global";
import { eventModal } from "@NextSkyTheme/modal";

class ActionSearch extends HTMLElement {
  constructor() {
    super();
    this.sectionId = this.dataset.sectionId;
    this.input = this.querySelector('input[type="search"]');
    this.form = this.querySelector("form#search_mini_form");
    this.templateRecommendedDefault = this.querySelector(
      ".template-recommended-default",
    );
    this.templateRecommendedPopup = this.querySelector(
      ".template-recommended-popup",
    );
    this.predictiveSearchResults = this.querySelector(".predictive-search");
    this.searchKeyword = this.querySelector(".search-keyword");
    this.recommendSearch = this.querySelector(".recommend-search");
    this.input?.addEventListener(
      "input",
      NextSkyTheme.debounce((event) => {
        this.onInput(event);
      }, 300).bind(this),
    );
    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const value = this.input.value.trim();
        const resultSearch = this.querySelector(".search-results__item");
        if (
          value &&
          resultSearch &&
          !this.input.closest("form").classList.contains("loading")
        ) {
          this.saveSearch(value);
        }
      }
    });
    document.addEventListener("mousedown", (e) => {
      const isClickOutside = !this.input.contains(e.target);
      const hasValue = this.input.value.trim() !== "";
      const value = this.input.value.trim();
      const resultSearch = this.querySelector(".search-results__item");
      if (
        isClickOutside &&
        hasValue &&
        resultSearch &&
        !this.input.closest("form").classList.contains("loading")
      ) {
        this.saveSearch(value);
      }
    });
    this.input.addEventListener("click", this.hideAnimationText.bind(this));
    this.showSearchHistory();
    window.Shopify.designMode &&
      (document.addEventListener("shopify:section:select", (event) => {
        const currentTarget = event.target;
        if (
          JSON.parse(currentTarget.dataset.shopifyEditorSection).id ===
          this.sectionId
        ) {
          eventModal(this, "open", false);
          if (this.type == "popup") {
            NextSkyTheme.getRoot().classList.add("open-modal-search-popup");
          }

          if (
            this.querySelector(".search-animation") &&
            this.querySelector(".search-animation").classList.contains(
              "hidden-important",
            )
          ) {
            setTimeout(() => this.input.focus(), 10);
          }
        }
      }),
      document.addEventListener("shopify:section:deselect", () => {
        const searchSection = document.querySelector("action-search");
        this.getHeaderOffset();
        if (searchSection) {
          eventModal(searchSection, "close", false);
        }
      }));
  }

  get actionSearch() {
    return document.querySelector("#search-icon-bubble") || null;
  }

  get type() {
    return this.getAttribute("data-type");
  }

  connectedCallback() {
    this.saveSearchFromUrl();
    if (this.actionSearch) {
      this.actionSearch.addEventListener("click", (event) => {
        event.preventDefault();
        if (
          this.recommendSearch &&
          this.recommendSearch.querySelector("template") &&
          this.templateRecommendedDefault
        ) {
          this.updateProductRecommended();
        }
        this.getHeaderOffset();
        eventModal(this, "open", false);
        if (this.type == "popup") {
          NextSkyTheme.getRoot().classList.add("open-modal-search-popup");
        }
        setTimeout(() => this.input.focus(), 10);
        NextSkyTheme.global.rootToFocus = this.actionSearch;
      });
    }
    if (this.type == "popup") {
      this.innerWidth();
    }
  }

  getHeaderOffset() {
    const header = document.querySelector(".header-site");
    const rect = header.getBoundingClientRect();
    document.body.style.setProperty("--header-offset", `${rect.top}px`);
  }

  saveSearchFromUrl() {
    const hasMainSearch = document.querySelector(".section-main-search");
    if (
      hasMainSearch &&
      !hasMainSearch.classList.contains("template-search--empty")
    ) {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q");
      if (!q) return;
      const value = q.trim();
      if (!value) return;
      this.saveSearch(value);
    }
  }

  saveSearch(value) {
    let history = JSON.parse(localStorage.getItem("search_history")) || [];

    history = history.filter(
      (item) => item.toLowerCase() !== value.toLowerCase(),
    );
    history.unshift(value);
    history = history.slice(0, 10);

    localStorage.setItem("search_history", JSON.stringify(history));
  }

  showSearchHistory() {
    const history = JSON.parse(localStorage.getItem("search_history")) || [];
    const list = document.querySelector(".history-list");
    const template = document.getElementById("history-item-template");
    const clearTemplate = document.getElementById("history-clear-template");
    if (!list || !template) {
      return;
    }
    const search_history_div = list.closest("#search-history");
    if (history.length === 0) {
      list.innerHTML = "";
      search_history_div.classList.remove("mb-sp-4", "mb-1025-sp-6", "mt-1025-sp-6");
      return;
    }
    list.innerHTML = "";
    history.forEach((item) => {
      const clone = template.content.cloneNode(true);
      const link = clone.querySelector("a");
      link.querySelector(".text").textContent = item;
      link.href = `${routes.search_url}?type=product&options%5Bprefix%5D=last&q=${encodeURIComponent(item)}`;
      list.appendChild(clone);
    });
    const clearClone = clearTemplate.content.cloneNode(true);
    clearClone
      .querySelector(".clear-history-btn")
      .addEventListener("click", () => {
        localStorage.removeItem("search_history");
        this.showSearchHistory();
      });
    list.appendChild(clearClone);
  }

  innerWidth() {
    let width = window.innerWidth;
    window.addEventListener("resize", () => {
      const newWidth = window.innerWidth;
      if (newWidth <= 1024 && width > 1024) {
        this.actionSearchMobile();
      }
      if (newWidth > 1024 && width <= 1024) {
        this.actionSearchDesktop();
      }
      width = newWidth;
    });
    if (width <= 1024) {
      this.actionSearchMobile();
    } else {
      this.actionSearchDesktop();
    }
  }

  updateProductRecommended() {
    if (
      this.classList.contains("search-type-popup") &&
      this.templateRecommendedPopup
    ) {
      const content = document.createElement("div");
      content.appendChild(
        this.templateRecommendedPopup.content.firstElementChild.cloneNode(true),
      );
      this.recommendSearch.innerHTML = content.innerHTML;
    } else {
      const content = document.createElement("div");
      content.appendChild(
        this.templateRecommendedDefault.content.firstElementChild.cloneNode(
          true,
        ),
      );
      this.recommendSearch.innerHTML = content.innerHTML;
    }
    this.recommendSearch.classList.add("update-recommended");
    new LazyLoader(".image-lazy-load");
  }

  actionSearchMobile() {
    this.classList.remove("search-type-popup");
    this.classList.add("search-type-drawer");
    this.onInput();
    if (
      this.templateRecommendedDefault &&
      this.recommendSearch.classList.contains("update-recommended")
    ) {
      this.updateProductRecommended();
    }
  }

  actionSearchDesktop() {
    this.classList.remove("search-type-drawer");
    this.classList.add("search-type-popup");
    this.onInput();
    if (
      this.templateRecommendedDefault &&
      this.recommendSearch.classList.contains("update-recommended")
    ) {
      this.updateProductRecommended();
    }
  }

  onInput() {
    this.hideAnimationText();
    const searchTerm = this.input.value.trim();
    if (!searchTerm.length) {
      this.form.classList.remove("results", "on-input", "loading");
      NextSkyTheme.trapFocus(this);
      return;
    }
    let predictiveSearch = "predictive-search-drawer";
    if (this.classList.contains("search-type-popup")) {
      predictiveSearch = "predictive-search-popup";
    }
    this.form.classList.add("loading", "on-input");
    if (this.predictiveSearchResults) {
      this.getSearchResults(searchTerm, predictiveSearch);
      return;
    }
    NextSkyTheme.trapFocus(this);
  }

  getSearchResults(searchTerm, predictiveSearch) {
    const query = `${routes.predictive_search_url}?q=${encodeURIComponent(
      searchTerm,
    )}&section_id=${predictiveSearch}&resources[options][fields]=title,tag,vendor,product_type,variants.title,variants.sku&resources[limit]=10&resources[limit_scope]=each`;
    fetch(query)
      .then((response) => {
        if (!response.ok) {
          var error = new Error(response.status);
          this.form.classList.remove("loading", "results");
          throw error;
        }
        return response.text();
      })
      .then((text) => {
        const resultsMarkup = new DOMParser()
          .parseFromString(text, "text/html")
          .querySelector(`#shopify-section-${predictiveSearch}`)?.innerHTML;
        if (this.predictiveSearchResults) {
          this.predictiveSearchResults.innerHTML = resultsMarkup;
        }
        this.form.classList.remove("loading");
        this.form.classList.add("results");
        if (this.querySelectorAll(".more-result-link").length > 0) {
          this.querySelectorAll(".more-result-link").forEach((e) => {
            e.href = `${routes.search_url}?q=${encodeURIComponent(
              searchTerm,
            )}&options%5Bprefix%5D=last`;
          });
        }
        NextSkyTheme.trapFocus(this);
      })
      .catch((error) => {
        this.form.classList.remove("loading", "results");
        throw error;
      });
  }

  hideAnimationText() {
    if (this.querySelector(".search-animation")) {
      this.querySelector(".search-animation").classList.add("hidden-important");
    }
  }
}
customElements.define("action-search", ActionSearch);

class SearchText extends HTMLElement {
  constructor() {
    super();
    Motion.inView(this, this.init.bind(this));
  }

  async init() {
    await this.animation(this.getAttribute("data-text"));
  }

  async animation(text) {
    ((this.innerHTML = text),
      await Motion.animate(
        this,
        {
          width: [0, `${this.scrollWidth + 1}px`],
        },
        {
          duration: 0.7,
          delay: 0.5,
        },
      ).finished,
      this.closest(".search-animation")
        .querySelector(".text-cursor")
        .classList.remove("hidden-important"));
  }
}
customElements.define("search-text", SearchText);
