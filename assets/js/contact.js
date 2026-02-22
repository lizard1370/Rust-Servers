const formValidationRules = {
  name: {
    required: true,
    minLength: 2,
    message: 'Name must be at least 2 characters'
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  subject: {
    required: true,
    minLength: 5,
    message: 'Subject must be at least 5 characters'
  },
  message: {
    required: true,
    minLength: 10,
    message: 'Message must be at least 10 characters'
  }
};

function validateField(fieldName, value) {
  const rules = formValidationRules[fieldName];
  if (!rules) return true;

  if (rules.required && !value.trim()) {
    return false;
  }

  if (rules.minLength && value.length < rules.minLength) {
    return false;
  }

  if (rules.pattern && !rules.pattern.test(value)) {
    return false;
  }

  return true;
}

function showFieldError(fieldName, show) {
  const formGroup = document.querySelector(`[data-field="${fieldName}"]`);
  if (!formGroup) return;

  if (show) {
    formGroup.classList.add('error');
  } else {
    formGroup.classList.remove('error');
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.querySelector('form');
  if (!contactForm) return;

  const inputs = contactForm.querySelectorAll('input[type="text"], input[type="email"], textarea, select');

  inputs.forEach(input => {
    const fieldName = input.name;
    const formGroup = input.closest('.form-group');

    if (formGroup && !formGroup.hasAttribute('data-field')) {
      formGroup.setAttribute('data-field', fieldName);
    }

    input.addEventListener('blur', function() {
      const isValid = validateField(fieldName, this.value);
      showFieldError(fieldName, !isValid);
    });

    input.addEventListener('input', function() {
      const isValid = validateField(fieldName, this.value);
      if (isValid) {
        showFieldError(fieldName, false);
      }
    });
  });

  const submitButton = contactForm.querySelector('.btn-submit');
  const formMessage = document.querySelector('.form-message');

  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();

    let isFormValid = true;
    inputs.forEach(input => {
      const isValid = validateField(input.name, input.value);
      showFieldError(input.name, !isValid);
      if (!isValid) isFormValid = false;
    });

    if (isFormValid) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';

      const formData = {
        name: contactForm.querySelector('[name="name"]').value,
        email: contactForm.querySelector('[name="email"]').value,
        subject: contactForm.querySelector('[name="subject"]').value,
        message: contactForm.querySelector('[name="message"]').value,
        timestamp: new Date().toISOString(),
        id: Date.now()
      };

      let contacts = JSON.parse(localStorage.getItem('rust_contacts') || '[]');
      contacts.push(formData);
      localStorage.setItem('rust_contacts', JSON.stringify(contacts));

      setTimeout(() => {
        formMessage.textContent = 'Thank you for reaching out! We will get back to you soon.';
        formMessage.classList.remove('error');
        formMessage.classList.add('success');

        this.reset();
        inputs.forEach(input => {
          showFieldError(input.name, false);
        });

        submitButton.disabled = false;
        submitButton.textContent = 'Send Message';

        setTimeout(() => {
          formMessage.classList.remove('success');
        }, 5000);
      }, 1000);
    }
  });
});
