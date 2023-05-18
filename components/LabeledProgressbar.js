class LabeledProgressbar extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <div class="row">
        <label for="${this.name}">${this.value}/${this.max}</label>
        <div class="spacer"></div>
        <progress id="${this.name}" max="${this.max}" value="${this.value}"></progress>
      </div>
    `;
  }

  get value() {
    return this.getAttribute('value');
  }

  set value(value) {
    this.setAttribute('value', value);
    this.render();
  }
}

customElements.define('labeled-progressbar', LabeledProgressbar);