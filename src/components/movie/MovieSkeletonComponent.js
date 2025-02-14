import CustomComponent from "../../abstracts/CustomComponent";

export default class MovieSkeletonComponent extends CustomComponent {
  template() {
    return `
        <a>
          <div class="item-card">
            <div class="item-thumbnail skeleton"></div>
            <div class="item-title skeleton"></div>
            <div class="item-score skeleton"></div>
          </div>
        </a>
        `;
  }
}

customElements.define("movie-item-skeleton", MovieSkeletonComponent);
