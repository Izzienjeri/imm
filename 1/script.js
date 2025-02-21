document.addEventListener('DOMContentLoaded', () => {
  const imageUpload = document.getElementById('imageUpload');
  const uploadedImage = document.getElementById('uploadedImage');
  const rotateBtn = document.getElementById('rotateBtn');
  const resetBtn = document.getElementById('resetBtn');
  const zoomSlider = document.getElementById('zoomSlider');
  const brightnessSlider = document.getElementById('brightnessSlider');
  const contrastSlider = document.getElementById('contrastSlider');
  const confirmResetBtn = document.getElementById('confirmResetBtn');
  const controls = document.querySelector('.controls');
  const resetConfirmationModal = new bootstrap.Modal(document.getElementById('resetConfirmationModal'));
  const placeholderIcon = document.querySelector('.placeholder-icon');
   const toastLive = document.getElementById('liveToast');
   const toast = bootstrap.Toast.getOrCreateInstance(toastLive)

  let currentAngle = 0;

  // Enable/disable controls and update tooltip
  function updateControlState(imageLoaded) {
      const controls = [rotateBtn, resetBtn, zoomSlider, brightnessSlider, contrastSlider];
      controls.forEach(control => control.disabled = !imageLoaded);

      if (imageLoaded) {
          controls[0].closest('.controls').setAttribute('data-bs-title', 'Modify your image');
           placeholderIcon.style.display = 'none';
      } else {
          controls[0].closest('.controls').setAttribute('data-bs-title', 'Please upload an image to continue');
           placeholderIcon.style.display = 'block';
      }

       // Refresh tooltip (needed after changing content)
      const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
  }

   // Show toast notification
  function showToast(message) {
      toastLive.querySelector('.toast-body').textContent = message;
      toast.show();
  }


  imageUpload.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (!file) {
          return; // Exit if no file selected
      }
      if (!file.type.startsWith('image/')) {
          showToast('Please select a valid image file.');
          return;
      }
      const reader = new FileReader();

      reader.onload = (e) => {
          uploadedImage.hidden=false;
          uploadedImage.src = e.target.result;
          uploadedImage.alt = `Uploaded Image: ${file.name}`; // Update alt text
          resetSettings(); // Reset on new image load
          updateControlState(true); // Enable controls

      };

      reader.readAsDataURL(file);
  });

  rotateBtn.addEventListener('click', () => {
      currentAngle += 90;
      modifyImage();
  });

  // Reset button - Show modal
  resetBtn.addEventListener('click', () => {
     resetConfirmationModal.show();
  });

 // Confirm reset button within modal
  confirmResetBtn.addEventListener('click', () => {
      resetSettings();
      resetConfirmationModal.hide();
  });

  zoomSlider.addEventListener('input', modifyImage);
  brightnessSlider.addEventListener('input', modifyImage);
  contrastSlider.addEventListener('input', modifyImage);


  function modifyImage() {
      uploadedImage.style.transform = `rotate(${currentAngle}deg) scale(${zoomSlider.value / 100})`;
      uploadedImage.style.filter = `brightness(${brightnessSlider.value}%) contrast(${contrastSlider.value}%)`;
  }

  function resetSettings() {
      currentAngle = 0;
      zoomSlider.value = 100;
      brightnessSlider.value = 100;
      contrastSlider.value = 100;
      modifyImage();
      imageUpload.value = '';

  }
  // Initialize tooltips on page load
   const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
  const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
   updateControlState(false);
});