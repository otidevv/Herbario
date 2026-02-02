class PhotoBlogViewer {
  constructor() {
    this.photos = this.getPhotosFromHTML();
    this.currentIndex = 0;
    this.currentZoom = 1;
    this.minZoom = 1;
    this.maxZoom = 5;
    this.zoomStep = 0.2;
    this.isCursorOverImage = false;

    this.initializeElements();
    this.initializeEventListeners();
    this.generateThumbnails();

    if (this.photos.length) this.loadPhoto(0);
  }

  getPhotosFromHTML() {
    return Array.from(document.querySelectorAll('[data-photo]')).map(img => ({
      src: img.src,
      alt: img.alt || 'Imagen'
    }));
  }

  initializeElements() {
    const ids = [
      'mainImage', 'zoomContainer', 'zoomInfo', 'cursorIndicator', 'thumbnailGallery',
      'mainViewer', 'fullscreenBtn', 'viewerContainer',
      'zoomInBtn', 'zoomOutBtn', 'resetBtn', 'prevBtn', 'nextBtn'
    ];
    ids.forEach(id => this[id] = document.getElementById(id));
  }

  initializeEventListeners() {
    this.zoomInBtn.onclick = () => this.zoomIn();
    this.zoomOutBtn.onclick = () => this.zoomOut();
    this.resetBtn.onclick = () => this.resetZoom();
    this.prevBtn.onclick = () => this.previousPhoto();
    this.nextBtn.onclick = () => this.nextPhoto();

    this.mainImage.addEventListener('wheel', e => this.handleWheel(e));
    this.mainImage.addEventListener('mouseenter', () => this.startImageHover());
    this.mainImage.addEventListener('mouseleave', () => this.stopImageHover());
    this.mainImage.addEventListener('mousemove', e => this.updateImageHover(e));

    this.fullscreenBtn.onclick = () => this.toggleFullscreen();
    document.addEventListener('keydown', e => this.handleKeyboard(e));
    document.addEventListener('fullscreenchange', () => this.adjustImageSize());
    window.addEventListener('resize', () => this.adjustImageSize());
  }

  generateThumbnails() {
    this.thumbnailGallery.innerHTML = '';
    this.photos.forEach((photo, index) => {
      const thumbnail = document.createElement('div');
      thumbnail.className = 'thumbnail';
      thumbnail.style.backgroundImage = `url(${photo.src})`;
      thumbnail.onclick = () => this.loadPhoto(index);
      this.thumbnailGallery.appendChild(thumbnail);
    });
  }

  loadPhoto(index) {
    if (index < 0 || index >= this.photos.length) return;
    this.currentIndex = index;
    this.mainImage.src = this.photos[index].src;
    this.mainImage.alt = this.photos[index].alt;
    this.mainImage.onload = () => {
      this.adjustImageSize();
      this.resetZoom();
      this.updateThumbnailSelection();
    };
  }

  adjustImageSize() {
    const { clientWidth: w, clientHeight: h } = this.zoomContainer;
    if (!this.mainImage.complete || !this.mainImage.naturalWidth) return;
    const imgRatio = this.mainImage.naturalWidth / this.mainImage.naturalHeight;
    const containerRatio = w / h;

    if (imgRatio > containerRatio) {
      this.mainImage.style.width = '100%';
      this.mainImage.style.height = 'auto';
    } else {
      this.mainImage.style.width = 'auto';
      this.mainImage.style.height = '100%';
    }
  }

  updateThumbnailSelection() {
    this.thumbnailGallery.querySelectorAll('.thumbnail').forEach((thumb, index) => {
      thumb.classList.toggle('active', index === this.currentIndex);
    });
  }

  startImageHover() {
    this.isCursorOverImage = true;
    this.updateCursorIndicator(true, 'Zoom activo - Usa la rueda del ratón');
  }

  stopImageHover() {
    this.isCursorOverImage = false;
    this.updateCursorIndicator(false, 'Coloca el cursor sobre la imagen para hacer zoom');
  }

  updateImageHover(event) {
    if (!this.isCursorOverImage) return;

    const rect = this.mainImage.getBoundingClientRect();
    const xPercent = Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100));
    const yPercent = Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100));

    this.mainImage.style.transformOrigin = `${xPercent}% ${yPercent}%`;

    if (this.currentZoom > 1) {
      this.cursorIndicator.textContent = `Punto focal: ${Math.round(xPercent)}%, ${Math.round(yPercent)}%`;
    }
  }

  updateCursorIndicator(active, text) {
    this.cursorIndicator.style.opacity = active ? '1' : '0.7';
    this.cursorIndicator.style.backgroundColor = active ? 'rgba(34, 197, 94, 0.9)' : 'rgba(102, 126, 234, 0.9)';
    this.cursorIndicator.textContent = text;
  }

  handleWheel(e) {
    if (!this.isCursorOverImage) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -this.zoomStep : this.zoomStep;
    this.setZoom(this.currentZoom + delta);
  }

  zoomIn() { this.setZoom(this.currentZoom + this.zoomStep); }
  zoomOut() { this.setZoom(this.currentZoom - this.zoomStep); }

  setZoom(zoom) {
    this.currentZoom = Math.min(this.maxZoom, Math.max(this.minZoom, zoom));
    this.mainImage.style.transform = `scale(${this.currentZoom})`;
    this.zoomInfo.textContent = `Zoom: ${Math.round(this.currentZoom * 100)}%`;
  }

  resetZoom() {
    this.currentZoom = 1;
    this.mainImage.style.transform = 'scale(1)';
    this.mainImage.style.transformOrigin = 'center center';
    this.zoomInfo.textContent = `Zoom: 100%`;
    this.updateCursorIndicator(false, 'Coloca el cursor sobre la imagen para hacer zoom');
    setTimeout(() => this.adjustImageSize(), 100);
  }

  previousPhoto() {
    this.loadPhoto((this.currentIndex - 1 + this.photos.length) % this.photos.length);
  }

  nextPhoto() {
    this.loadPhoto((this.currentIndex + 1) % this.photos.length);
  }

  handleKeyboard(e) {
    const actions = {
      'ArrowLeft': () => this.previousPhoto(),
      'ArrowRight': () => this.nextPhoto(),
      '+': () => this.zoomIn(),
      '=': () => this.zoomIn(),
      '-': () => this.zoomOut(),
      '0': () => this.resetZoom(),
      'f': () => this.toggleFullscreen(),
      'F': () => this.toggleFullscreen(),
      'Escape': () => this.exitFullscreen()
    };
    if (actions[e.key]) actions[e.key]();
  }

  toggleFullscreen() {
    document.fullscreenElement ? this.exitFullscreen() : this.enterFullscreen();
  }

  enterFullscreen() {
    const el = this.viewerContainer;
    (el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen || el.mozRequestFullScreen).call(el);
  }

  exitFullscreen() {
    (document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen || document.mozCancelFullScreen).call(document);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.photoBlog = new PhotoBlogViewer();
});

// Función para regresar al index
function goToIndex() {
  window.location.href = "/";
}

// Efecto de pulso al botón
setInterval(() => {
  const btn = document.querySelector('.back-to-index-btn');
  btn.style.transform = 'scale(1.1)';
  setTimeout(() => btn.style.transform = 'scale(1)', 200);
}, 10000);
