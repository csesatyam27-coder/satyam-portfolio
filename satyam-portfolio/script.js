const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");
const navLinks = [...document.querySelectorAll(".nav a")];
const sections = [...document.querySelectorAll("main section[id]")];
const revealItems = [...document.querySelectorAll(".reveal")];
const filterButtons = [...document.querySelectorAll(".filter-button")];
const projectCards = [...document.querySelectorAll(".project-card")];
const skillCards = [...document.querySelectorAll(".skill-card")];
const skillSearch = document.getElementById("skillSearch");
const skillsResult = document.getElementById("skillsResult");
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const metricValues = [...document.querySelectorAll(".metric-value")];
const scrollProgressBar = document.getElementById("scrollProgressBar");
const toast = document.getElementById("toast");
const EMAILJS_PUBLIC_KEY = "3YK4QgAcCbH8U4Ku_";
const EMAILJS_SERVICE_ID = "service_isbikwn";
const EMAILJS_TEMPLATE_ID = "template_0eoded4";

if (window.emailjs) {
  window.emailjs.init({
    publicKey: EMAILJS_PUBLIC_KEY,
  });
}

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    navToggle.setAttribute("aria-label", expanded ? "Open navigation" : "Close navigation");
    nav.classList.toggle("is-open");
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !nav || !navToggle) {
    return;
  }

  nav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open navigation");
});

const showToast = (message) => {
  if (!toast) {
    return;
  }

  toast.textContent = message;
  toast.classList.add("is-visible");

  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 3000);
};

const openMailFallback = ({ name, email, message }) => {
  const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\n\nProject details:\n${message}`
  );

  window.location.href = `mailto:csesatyam27@gmail.com?subject=${subject}&body=${body}`;
};

const updateScrollProgress = () => {
  if (!scrollProgressBar) {
    return;
  }

  const scrollTop = window.scrollY;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  scrollProgressBar.style.width = `${progress}%`;
};

window.addEventListener("scroll", updateScrollProgress, { passive: true });
updateScrollProgress();

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const currentId = entry.target.getAttribute("id");
      navLinks.forEach((link) => {
        link.classList.toggle("is-current", link.getAttribute("href") === `#${currentId}`);
      });
    });
  },
  {
    threshold: 0.35,
  }
);

sections.forEach((section) => sectionObserver.observe(section));

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.18,
  }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index * 60, 320)}ms`;
  revealObserver.observe(item);
});

const animateMetric = (element) => {
  const target = Number(element.dataset.target || 0);
  const suffix = element.dataset.suffix || "";
  const duration = 1200;
  const startTime = performance.now();

  const step = (currentTime) => {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    element.textContent = `${value}${suffix}`;

    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };

  window.requestAnimationFrame(step);
};

const metricObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      animateMetric(entry.target);
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.5 }
);

metricValues.forEach((metric) => metricObserver.observe(metric));

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selected = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");

    projectCards.forEach((card) => {
      const matches = selected === "all" || card.dataset.category === selected;
      card.classList.toggle("is-hidden", !matches);
    });
  });
});

if (skillSearch && skillsResult) {
  skillSearch.addEventListener("input", () => {
    const query = skillSearch.value.trim().toLowerCase();
    let visibleCount = 0;

    skillCards.forEach((card) => {
      const haystack = `${card.dataset.skill || ""} ${card.textContent}`.toLowerCase();
      const matches = !query || haystack.includes(query);
      card.classList.toggle("is-hidden", !matches);
      if (matches) {
        visibleCount += 1;
      }
    });

    skillsResult.textContent = query
      ? `${visibleCount} skill section${visibleCount === 1 ? "" : "s"} matched`
      : "Showing all strengths";
  });
}

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !message) {
      formStatus.textContent = "Please complete all fields before sending your inquiry.";
      return;
    }

    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailIsValid) {
      formStatus.textContent = "Please enter a valid email address.";
      return;
    }

    if (!window.emailjs) {
      formStatus.textContent = "Direct email fallback opened because the email service is unavailable right now.";
      openMailFallback({ name, email, message });
      return;
    }

    const submitButton = contactForm.querySelector(".form-submit");

    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }

      formStatus.textContent = "Sending your message...";

      await window.emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          name,
          email,
          message,
          title: `New portfolio inquiry from ${name}`,
          time: new Date().toLocaleString(),
        }
      );

      formStatus.textContent = "Message sent successfully. I will get back to you soon.";
      showToast("Message sent successfully.");
      contactForm.reset();
    } catch (error) {
      formStatus.textContent = "Instant send failed, so your email app is opening with the message filled in.";
      showToast("Opening email fallback.");
      openMailFallback({ name, email, message });
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Send Project Inquiry";
      }
    }
  });
}
