// ── CONFIG — replace with your real Supabase project values ──────────────────
const SUPABASE_URL      = "https://dnaqhplagshllotdhixg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuYXFocGxhZ3NobGxvdGRoaXhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNzU1MzgsImV4cCI6MjA5MDY1MTUzOH0.Qvho5YSF6P2TfRq-p4-ay8EUjcI6n6TZ2ycgMotRZqk";
// ─────────────────────────────────────────────────────────────────────────────

const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/send-inscription`;


// ── Scroll reveal (Intersection Observer) ────────────────────────────────────

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('[data-animate]').forEach(el => revealObserver.observe(el));


// ── Animated counters ─────────────────────────────────────────────────────────

function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  const duration = 1800;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.floor(eased * target);
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = target;
    }
  };

  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const numEl = entry.target.querySelector('.stat-num');
      if (numEl) animateCounter(numEl);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-item').forEach(el => counterObserver.observe(el));


// ── Cycle toggle (Maternelle / Primaire) ──────────────────────────────────────

const cycleBtns  = document.querySelectorAll('.cycle-btn');
const cycleInput = document.getElementById('selectedCycle');
const levelSelect = document.getElementById('level');

function setOptgroups(cycle) {
  const mat = levelSelect.querySelector('#optMaternelle');
  const pri = levelSelect.querySelector('#optPrimaire');
  mat.disabled = cycle !== 'maternelle';
  pri.disabled = cycle !== 'primaire';
  levelSelect.value = '';
}

cycleBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    cycleBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cycle = btn.dataset.cycle;
    cycleInput.value = cycle;
    setOptgroups(cycle);
  });
});

setOptgroups('maternelle'); // default


// ── Form validation & submission ──────────────────────────────────────────────

const form       = document.getElementById('regForm');
const successMsg = document.getElementById('successMsg');
const submitBtn  = form.querySelector('.btn-submit');

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  // Validate required fields
  let valid = true;
  form.querySelectorAll('[required]').forEach(field => {
    field.classList.remove('invalid');
    const empty = field.type === 'checkbox' ? !field.checked : !field.value.trim();
    if (empty) { field.classList.add('invalid'); valid = false; }
  });

  if (!valid) {
    form.querySelector('.invalid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Loading state
  submitBtn.textContent = 'Envoi en cours…';
  submitBtn.disabled = true;

  // Collect form data
  const payload = {
    cycle:         cycleInput.value,
    student_first: form.studentFirst.value.trim(),
    student_last:  form.studentLast.value.trim(),
    birth_date:    form.birthDate.value,
    gender:        form.gender.value,
    nationality:   form.nationality?.value.trim() || '',
    level:         form.level.value,
    parent_first:  form.parentFirst.value.trim(),
    parent_last:   form.parentLast.value.trim(),
    email:         form.email.value.trim(),
    phone:         form.phone.value.trim(),
    address:       form.address?.value.trim() || '',
    message:       form.message?.value.trim() || '',
  };

  try {
    const res = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erreur serveur');

    // Success
    form.style.display = 'none';
    successMsg.style.display = 'block';
    successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });

  } catch (err) {
    console.error(err);
    submitBtn.textContent = 'Envoyer ma demande d\'inscription';
    submitBtn.disabled = false;
    showFormError('Une erreur est survenue. Veuillez réessayer ou nous contacter par téléphone.');
  }
});

function showFormError(msg) {
  let el = document.getElementById('formError');
  if (!el) {
    el = document.createElement('p');
    el.id = 'formError';
    el.style.cssText = 'color:#fa394a;font-size:.9rem;text-align:center;margin-top:14px;font-weight:600;';
    submitBtn.insertAdjacentElement('afterend', el);
  }
  el.textContent = msg;
}

// Remove invalid style on interaction
form.querySelectorAll('input, select, textarea').forEach(field => {
  field.addEventListener('input',  () => field.classList.remove('invalid'));
  field.addEventListener('change', () => field.classList.remove('invalid'));
});

// Reset form
function resetForm() {
  form.reset();
  form.style.display = 'block';
  successMsg.style.display = 'none';
  submitBtn.textContent = 'Envoyer ma demande d\'inscription';
  submitBtn.disabled = false;
  setOptgroups('maternelle');
  cycleBtns.forEach((b, i) => b.classList.toggle('active', i === 0));
  cycleInput.value = 'maternelle';
  const errEl = document.getElementById('formError');
  if (errEl) errEl.remove();
}


// ── Mobile burger menu ────────────────────────────────────────────────────────

const burger = document.getElementById('burger');
const nav    = document.querySelector('.nav');

burger.addEventListener('click', () => {
  const open = nav.style.display === 'flex';
  nav.style.display = open ? 'none' : 'flex';
  if (!open) {
    Object.assign(nav.style, {
      flexDirection: 'column',
      position:      'absolute',
      top:           '74px',
      left:          '0',
      right:         '0',
      background:    'rgba(255,255,255,0.96)',
      backdropFilter: 'blur(16px)',
      padding:       '16px 24px',
      boxShadow:     '0 12px 32px rgba(0,0,0,0.12)',
      zIndex:        '99',
      gap:           '4px',
    });
  }
});

document.querySelectorAll('.nav a').forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 768) nav.style.display = 'none';
  });
});


// ── Header glassmorphism + shadow on scroll ───────────────────────────────────

const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
  const scrolled = window.scrollY > 20;
  header.classList.toggle('scrolled', scrolled);
  header.style.boxShadow = scrolled
    ? '0 4px 24px rgba(0,0,0,0.10)'
    : '0 1px 3px rgba(0,0,0,0.08)';
}, { passive: true });
