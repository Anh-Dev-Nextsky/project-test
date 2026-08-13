import * as NextSkyTheme from "@NextSkyTheme/global";
import { ProductForm } from "@NextSkyTheme/add-to-cart";
import { LazyLoadEventHover, LazyLoader } from "@NextSkyTheme/lazy-load";
import { notifier } from "@NextSkyTheme/notification";
import { eventModal } from "@NextSkyTheme/modal";

LazyLoadEventHover.run();
class MainCartEdit extends HTMLElement {
  constructor() {
    super();
    this.init();
    this.key = this.getAttribute("data-key");
    this.quantity = this.getAttribute("data-quantity");
    this.index = this.getAttribute("data-index");
    const href = this.getAttribute("data-href");
    const urlLocal = window.shopUrl;
    const variant =
      href.indexOf("?") > -1 ||
      href.indexOf("?variant=") > -1 ||
      href.indexOf("&variant=") > -1
        ? "&"
        : "/?";
    this.url = urlLocal + href + variant + "section_id=main-cart-edit";
  }

  init() {
    this.addEventListener("click", (e) => this.onClick(e));
    this.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        this.onClick(e);
      }
    });
  }

  onClick(e) {
    this.addLoading(true);
    e.preventDefault();
    fetch(this.url)
      .then((response) => {
        if (!response.ok) {
          var error = new Error(response.status);
          throw error;
        }
        return response.text();
      })
      .then((response) => {
        const resultsHtml = NextSkyTheme.parser
          .parseFromString(response, "text/html")
          .getElementById("shopify-section-main-cart-edit");
        const modal = resultsHtml.querySelector("main-cart-edit-popup");
        NextSkyTheme.getBody().appendChild(modal);
        new LazyLoader(".image-lazy-load");
        setTimeout(
          () =>
            eventModal(
              document.querySelector("main-cart-edit-popup"),
              "open",
              true
            ),
          100
        );
        NextSkyTheme.global.rootToFocus = this;
      })
      .catch((error) => {
        throw error;
      })
      .finally(() => {
        this.addLoading(false);
        const modal = document.querySelector("main-cart-edit-popup");
        if (!modal) return;
        const quantity = modal.querySelector(
          'quantity-input [name="quantity"]'
        );
        quantity.value = this.quantity;
        const elementTotalPrice = modal.querySelector(".total-price__detail");
        const dataTotalPrice =
          elementTotalPrice.getAttribute("data-total-price");
        const totalPrice = NextSkyTheme.formatMoney(
          dataTotalPrice * this.quantity,
          cartStrings.money_format
        );
        elementTotalPrice.textContent = totalPrice;
        modal.setAttribute("data-key", this.key);
        modal.setAttribute("data-index", this.index);
      });
  }

  addLoading(action = false) {
    if (action) {
      this.classList.add("loading");
    } else {
      this.classList.remove("loading");
    }
  }
}
customElements.define("main-cart-edit", MainCartEdit);

if (!customElements.get("product-form-edit-cart")) {
  customElements.define(
    "product-form-edit-cart",
    class ProductFormCartEdit extends ProductForm {
      constructor() {
        super();
        this.form = this.querySelector("form");
        this.cart = document.querySelector("main-cart");
        if (this.form) {
          if (this.form.querySelector("[name=id]")) {
            this.form.querySelector("[name=id]").disabled = false;
          }
          this.form.addEventListener("submit", this.onSubmitHandler.bind(this));

          this.submitButton = this.querySelector('[type="submit"]');
          if (this.cart && this.submitButton)
            this.submitButton.setAttribute("aria-haspopup", "dialog");
          this.hideErrors = this.dataset.hideErrors === "true";
        }
        this.modal = document.querySelector("main-cart-edit-popup");
      }

      get cartKey() {
        return this.modal.getAttribute("data-key");
      }

      get cartIndex() {
        return this.modal.getAttribute("data-index");
      }

      get sectionId() {
        return this.cart.getAttribute("data-section-id");
      }

      onSubmitHandler(event) {
        event.preventDefault();
        if (this.submitButton.getAttribute("aria-disabled") === "true") return;
        this.submitButton.setAttribute("aria-disabled", true);
        this.submitButton.classList.add("loading");
        const config = NextSkyTheme.fetchConfig();
        const id = this.cartKey;
        const quantity = 0;
        config.body = JSON.stringify({
          id,
          quantity,
        });
        fetch(`${routes?.cart_change_url}`, config)
          .then((response) => {
            return response.text();
          })
          .catch((e) => {
            throw e;
          })
          .finally(() => {
            this.addNewCart();
          });
      }

      addNewCart() {
        this.addLoading(this.cartIndex, true);
        const config = NextSkyTheme.fetchConfig("javascript");
        config.headers["X-Requested-With"] = "XMLHttpRequest";
        delete config.headers["Content-Type"];
        const formData = new FormData(this.form);
        if (this.cart) {
          formData.append(
            "sections",
            this.getSectionsToRender().map((section) => section.id)
          );
          formData.append("sections_url", window.location.pathname);
          NextSkyTheme.global.rootToFocus = this.submitButton;
        }
        config.body = formData;
        fetch(`${routes.cart_add_url}`, config)
          .then((response) => response.json())
          .then((response) => {
            if (response.status) {
              NextSkyTheme.publish(NextSkyTheme.PUB_SUB_EVENTS.cartError, {
                source: "product-form",
                productVariantId: formData.get("id"),
                errors: response.errors || response.description,
                message: response.message,
              });
              if (this.querySelector(".product-form__error-message-wrapper")) {
                this.handleErrorMessage(response.description);
              }
              return;
            }
            this.updateMainCart(response);
            if (this.modal) {
              eventModal(
                document.querySelector("main-cart-edit-popup"),
                "close",
                true
              );
            }
            notifier.showElement(
              window.cartStrings.updateCartSuccess,
              null,
              "success",
              2500
            );
          })
          .catch((e) => {
            console.error(e);
          })
          .finally(() => {
            this.addLoading(this.cartIndex, false);
            new NextSkyTheme.FSProgressBar("free-ship-progress-bar");
            this.submitButton.classList.remove("loading");
          });
      }

      handleErrorMessage(errorMessage = false) {
        if (this.hideErrors) return;
        this.errorMessageWrapper =
          this.errorMessageWrapper ||
          this.querySelector(".product-form__error-message-wrapper");
        if (!this.errorMessageWrapper) return;
        this.errorMessage =
          this.errorMessage ||
          this.errorMessageWrapper.querySelector(
            ".product-form__error-message"
          );
        this.errorMessageWrapper.toggleAttribute("hidden", !errorMessage);
        if (errorMessage) {
          this.errorMessage.textContent = errorMessage;
        }
      }

      getSectionsToRender() {
        return [
          {
            id: this.sectionId,
            section: this.sectionId,
            selector: ".main-cart-items",
          },
          {
            id: "cart-icon-bubble",
            section: "cart-icon-bubble",
          },
          {
            id: this.sectionId,
            section: this.sectionId,
            selector: ".free-shipping-bar",
          },
          {
            id: this.sectionId,
            section: this.sectionId,
            selector: ".cart-info .totals",
          },
          {
            id: this.sectionId,
            section: this.sectionId,
            selector: ".cart-recommendations",
          },
        ];
      }
    }
  );
}
