// Configuration constants
const CONFIG = {
  maxWidth: 800,
  maxHeight: 600,
  imageQuality: 1,
  mobileCharLimit: 14,
  desktopCharLimit: 50
};

// State management
const state = {
  images: [],
  originalWeight: 0,
  compactWeight: 0
};

// Image processing utilities
const ImageProcessor = {
  async compressImage(file) {
    try {
      const reader = new FileReader();
      
      return new Promise((resolve, reject) => {
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target.result;
          
          img.onload = () => {
            const { width, height } = this.calculateDimensions(img);
            const canvas = this.createCanvas(img, width, height);
            
            canvas.toBlob((blob) => {
              const compressedSize = blob.size / 1024;
              const originalSize = file.size / 1024;
              const percentage = ((originalSize - compressedSize) / originalSize) * 100;
              
              resolve({
                blob,
                name: file.name,
                originalSize,
                compressedSize,
                percentage
              });
            }, 'image/jpeg', CONFIG.imageQuality);
          };
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Error compressing image:', error);
      throw error;
    }
  },

  calculateDimensions(img) {
    let { width, height } = img;
    
    if (width > height && width > CONFIG.maxWidth) {
      height *= CONFIG.maxWidth / width;
      width = CONFIG.maxWidth;
    } else if (height > CONFIG.maxHeight) {
      width *= CONFIG.maxHeight / height;
      height = CONFIG.maxHeight;
    }
    
    return { width, height };
  },

  createCanvas(img, width, height) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    return canvas;
  }
};

// UI Management
// In the UI object, add new methods
const UI = {
  scrollToCompressedImages() {
    document.getElementById('texttInfo').scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  },

  clearAllImages() {
    document.getElementById('listaImagens').innerHTML = '';
    const actionButtons = document.querySelector('.action-buttons');
    actionButtons?.remove();
    state.images = [];
    document.getElementById('texttInfo').classList.add('hidden');
  },

  updateImageList(imageData) {
    const listContainer = document.getElementById('listaImagens');
    const listItem = this.createImageListItem(imageData);
    
    // Add action buttons if they don't exist
    if (!document.querySelector('.action-buttons')) {
      const actionButtons = `
        <div class="action-buttons flex justify-end mb-4 gap-3">
          <button id="compressBtn" onclick="handleBulkDownload()" 
            class="bg-blue-600 hover:bg-blue-500 px-6 py-2.5 rounded-lg text-white font-medium transition-all duration-300 hover:shadow-lg flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Baixar Todos
          </button>
          <button id="removeAllBtn" onclick="UI.clearAllImages()" 
            class="bg-red-600 hover:bg-red-500 px-6 py-2.5 rounded-lg text-white font-medium transition-all duration-300 hover:shadow-lg flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            Remover Todos
          </button>
        </div>`;
      listContainer.insertAdjacentHTML('beforebegin', actionButtons);
    }
    
    listContainer.innerHTML += listItem;
    document.getElementById('texttInfo').classList.remove('hidden');
    this.scrollToCompressedImages();
  },

  createImageListItem(imageData) {
    const { blob, name, originalSize, compressedSize, percentage } = imageData;
    const truncatedName = this.truncateText(name);
    const compressionBadge = this.getCompressionBadge(percentage);

    return `
      <li class="list-none border rounded-lg shadow-md bg-white relative w-full overflow-hidden hover:shadow-xl transition-all duration-300 mb-4">
        <div class="flex flex-col md:flex-row items-start md:items-center p-4 md:p-5 gap-4 md:gap-6">
          <div class="shrink-0 w-full md:w-auto">
            <img class="w-full md:w-32 md:h-32 h-48 rounded-lg object-cover shadow-sm" src="${URL.createObjectURL(blob)}" alt="${name}">
          </div>
          <div class="flex-1 min-w-0 w-full">
            <div class="space-y-3">
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-semibold text-gray-700">NOME:</span>
                <span class="text-gray-600 break-all" title="${name}">${truncatedName}</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div class="flex items-center">
                  <span class="font-semibold text-gray-700 mr-2">ANTES:</span>
                  <span class="text-gray-600">${originalSize.toFixed(2)} KB</span>
                </div>
                <div class="flex items-center">
                  <span class="font-semibold text-gray-700 mr-2">DEPOIS:</span>
                  <span class="text-gray-600">${compressedSize.toFixed(2)} KB</span>
                </div>
                <div class="flex items-center">
                  <span class="font-semibold text-gray-700 mr-2">NÍVEL:</span>
                  ${compressionBadge}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="border-t bg-gray-50 p-3 md:p-4 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
          <button onclick="handleDownload('${URL.createObjectURL(blob)}', '${name}')" 
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2.5 rounded-lg text-white font-medium transition-all duration-300 hover:shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download
          </button>
          <button onclick="handleRemove(this)" 
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 px-4 py-2.5 rounded-lg text-white font-medium transition-all duration-300 hover:shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            Remover
          </button>
        </div>
      </li>
    `;
  },
  truncateText(text) {
    const maxLength = window.innerWidth < 720 ? CONFIG.mobileCharLimit : CONFIG.desktopCharLimit;
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  },

  getCompressionBadge(percentage) {
    const badges = {
      low: 'bg-red-600',
      medium: 'bg-yellow-600',
      high: 'bg-green-600',
      none: 'bg-gray-600'
    };

    let badgeColor = percentage <= 5 ? badges.none :
                     percentage <= 10 ? badges.low :
                     percentage <= 50 ? badges.medium : badges.high;

    return `<span class="px-2 py-1 text-white font-semibold rounded-md ${badgeColor}">${percentage.toFixed(2)}%</span>`;
  }
};

// Event Handlers
async function handleFileSelect() {
  const files = document.getElementById('fileInput').files;
  
  if (files.length === 0) {
    alert('Selecione um arquivo de imagem.');
    return;
  }

  for (const file of files) {
    try {
      const processedImage = await ImageProcessor.compressImage(file);
      state.images.push(processedImage);
      UI.updateImageList(processedImage);
    } catch (error) {
      console.error('Error processing file:', error);
    }
  }
}

function handleDownload(url, name) {
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
}

function handleRemove(button) {
  const listItem = button.closest('li');
  listItem.remove();
}

function handleBulkDownload() {
  if (state.images.length === 0) {
    alert('Sem imagens a serem compactadas, por favor faça UPLOAD!');
    return;
  }

  state.images.forEach(image => {
    handleDownload(URL.createObjectURL(image.blob), image.name);
  });
}

// Event Listeners
document.getElementById('fileInput').addEventListener('change', handleFileSelect);
