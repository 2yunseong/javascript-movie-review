import CustomComponent from "../abstracts/CustomComponent";
import HeaderComponent from "./AppHeaderComponent";
import MovieListComponent from "./movie/MovieListComponent";
import MoreButtonComponent from "./element/MoreButtonComponent";
import TitleComponent from "./element/TitleComponent";
import ModalComponent from "./ModalComponent";

import UpScrollButtonComponent from "./element/UpScrollButtonComponent";
import transformMovieItemsType from "../util/MovieList";
import {
  ACTION,
  REQUEST_URL,
  SEARCH_WARNING,
  TITLE,
} from "../constants/constants";
import { getRequest, transData } from "../api/handler";
import { urlByActionType } from "../api/url";
import { API_KEY } from "../constants/key";

export default class AppComponent extends CustomComponent {
  #nextPage = 1;
  #totalPage;
  #$movieList;
  #$movieListTitle;
  #$searchInput;
  #scrollThrottleId;

  render() {
    super.render();

    this.#$movieList = this.querySelector("movie-list");
    this.#$movieListTitle = this.querySelector("movie-list-title");
    this.#$searchInput = this.querySelector("input");

    this.popularListInit();
    this.getMovieData(ACTION.POPULAR);
    this.changeMoreButtonAction(ACTION.MORE_POPULAR);
  }

  urlByActionType(actionType) {
    switch (actionType) {
      case ACTION.POPULAR:
        return `${REQUEST_URL}/movie/popular?api_key=${API_KEY}&language=ko-KR&page=${
          this.#nextPage
        }`;
      case ACTION.SEARCH:
        return `${REQUEST_URL}/search/movie?api_key=${API_KEY}&language=ko-KR&query=${
          this.#$searchInput.value
        }&page=${this.#nextPage}&include_adult=false`;
    }
  }

  getMovieData(actionType) {
    fetch(this.urlByActionType(actionType), { method: "GET" })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          this.#totalPage = data.total_pages;

          const movieItems = transformMovieItemsType(data.results);
          this.#$movieList.renderPageSuccess(movieItems);

          this.#nextPage += 1;
          this.checkPage();
        } else {
          this.#$movieList.renderPageFail();
        }
      })
      .catch((error) => {
        this.#$movieList.renderPageFail();
      });
  }

  checkPage() {
    if (this.#totalPage < this.#nextPage) {
      this.querySelector("more-button").classList.add("hide");
      return;
    }
    this.querySelector("more-button").classList.remove("hide");
  }

  searchListInit() {
    this.#nextPage = 1;

    this.#$movieListTitle.setTitle(
      `"${this.#$searchInput.value}" ${TITLE.SEARCH}`
    );
    this.#$movieList.initialPage();
  }

  popularListInit() {
    this.#nextPage = 1;

    this.#$searchInput.value = "";
    this.#$movieListTitle.setTitle(TITLE.POPULAR);
    this.#$movieList.initialPage();
  }

  changeMoreButtonAction(actionType) {
    this.querySelector("more-button").setAttribute("data-action", actionType);
  }

  handleEvent() {
    this.addEventListener("click", (e) => {
      switch (e.target.dataset.action) {
        case ACTION.POPULAR:
          this.popularListInit();
          this.getMovieData(ACTION.POPULAR);
          this.changeMoreButtonAction(ACTION.MORE_POPULAR);
          break;
        case ACTION.SEARCH:
          this.searchListInit();
          this.getMovieData(ACTION.SEARCH);
          this.changeMoreButtonAction(ACTION.MORE_SEARCH);
          break;
        case ACTION.MORE_POPULAR:
          this.#$movieList.appendNewPage();
          this.getMovieData(ACTION.POPULAR);
          break;
        case ACTION.MORE_SEARCH:
          this.#$movieList.appendNewPage();
          this.getMovieData(ACTION.SEARCH);
          break;
        case "up-scroll":
          window.scroll({ top: 0, behavior: "smooth" });
          break;
        case "detail":
          const movieId = e.target.dataset.movieId;
          getRequest(
            `${REQUEST_URL}/movie/${movieId}?api_key=${API_KEY}&language=ko-KR`
          )
            .then((res) => {
              const modal = document.querySelector("modal-component");
              // 모달에게 상태를 넘겨주고
              modal.setAttribute("data-item", JSON.stringify(res));
              // 모달을 띄운다.
              modal.style.display = "flex";
              document.body.style.overflow = "hidden";
            })
            .catch((err) => {
              // 에러 문구를 출력한다.
            });
          break;
      }
    });

    this.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();

        if (!this.#$searchInput.value) {
          alert(SEARCH_WARNING);
          return;
        }

        this.searchListInit();
        this.getMovieData(ACTION.SEARCH);
        this.changeMoreButtonAction(ACTION.MORE_SEARCH);
      }
    });

    window.addEventListener("scroll", () => {
      this.toggleUpScrollButton();
      if (!this.#scrollThrottleId) {
        this.#scrollThrottleId = setTimeout(() => {
          if (this.getBoundingClientRect().bottom - window.innerHeight < 150) {
            this.#$movieList.appendNewPage();
            this.getMovieData(ACTION.POPULAR);
          }
          this.#scrollThrottleId = null;
        }, 1000);
      }
    });
  }

  toggleUpScrollButton() {
    const header = document.querySelector("app-header");
    const upScrollBtn = document.querySelector("up-scroll-button");
    if (header.getBoundingClientRect().bottom < 0) {
      upScrollBtn.classList.remove("hide");
      return;
    }
    upScrollBtn.classList.add("hide");
  }

  template() {
    return `
        <div id="app">
            <app-header></app-header>
            <main>
                <section class="item-view">
                    <movie-list-title></movie-list-title>
                    <movie-list></movie-list>
                    <more-button></more-button>
                </section>
            </main>
            <up-scroll-button class="hide"></up-scroll-button>
        </div>
        `;
  }
}

customElements.define("app-component", AppComponent);
