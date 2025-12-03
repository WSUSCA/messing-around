const stages = [
  {
    id: 'orientation',
    name: 'Orientation',
    milestones: ['Meet advisor', 'Upload resume draft'],
  },
  {
    id: 'skills',
    name: 'Skills Mapping',
    milestones: ['Identify three target roles', 'Audit key skills', 'Draft learning plan'],
  },
  {
    id: 'portfolio',
    name: 'Portfolio Ready',
    milestones: ['Resume reviewed', 'LinkedIn updated', 'Portfolio/Projects live'],
  },
  {
    id: 'experience',
    name: 'Experience Hunt',
    milestones: ['Apply to 5 roles weekly', 'Reach out to mentors', 'Mock interview scheduled'],
  },
  {
    id: 'offer',
    name: 'Offer & Launch',
    milestones: ['Negotiate offer', 'Onboarding checklist', '90-day plan'],
  },
];

const demoStudents = [
  {
    id: crypto.randomUUID(),
    name: 'Amaya Chen',
    email: 'amaya.chen@example.com',
    graduation: 2025,
    focus: 'Product Design',
    stage: 'portfolio',
    notes: 'Needs a case study polish and a mentor intro for fintech roles.',
    milestoneProgress: {
      orientation: [true, true],
      skills: [true, true, false],
      portfolio: [true, true, false],
      experience: [false, false, false],
      offer: [false, false, false],
    },
  },
  {
    id: crypto.randomUUID(),
    name: 'Diego Ramos',
    email: 'diego.ramos@example.com',
    graduation: 2024,
    focus: 'Data Analytics',
    stage: 'experience',
    notes: 'Mock interview completed; now targeting healthcare analytics internships.',
    milestoneProgress: {
      orientation: [true, true],
      skills: [true, true, true],
      portfolio: [true, true, true],
      experience: [true, false, false],
      offer: [false, false, false],
    },
  },
  {
    id: crypto.randomUUID(),
    name: 'Priya Singh',
    email: 'priya.singh@example.com',
    graduation: 2026,
    focus: 'Nursing',
    stage: 'skills',
    notes: 'Shadowed two nurses; exploring pediatrics vs. critical care.',
    milestoneProgress: {
      orientation: [true, true],
      skills: [false, false, false],
      portfolio: [false, false, false],
      experience: [false, false, false],
      offer: [false, false, false],
    },
  },
];

const elements = {
  stageSelect: document.getElementById('stage'),
  stageFilter: document.getElementById('stage-filter'),
  stats: document.getElementById('stats'),
  students: document.getElementById('students'),
  resultsCount: document.getElementById('results-count'),
  form: document.getElementById('student-form'),
  search: document.getElementById('search'),
  template: document.getElementById('student-template'),
  demoData: document.getElementById('demo-data'),
  download: document.getElementById('download-report'),
};

const storageKey = 'career-ready-students';

const loadStudents = () => {
  const stored = localStorage.getItem(storageKey);
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem(storageKey, JSON.stringify(demoStudents));
  return demoStudents;
};

let students = loadStudents();

const persist = () => localStorage.setItem(storageKey, JSON.stringify(students));

const renderStageOptions = () => {
  const options = stages
    .map((stage) => `<option value="${stage.id}">${stage.name}</option>`)
    .join('');
  elements.stageSelect.innerHTML = options;
  elements.stageSelect.value = stages[0].id;
  elements.stageFilter.insertAdjacentHTML('beforeend', options);
};

const totalMilestones = stages.reduce((sum, stage) => sum + stage.milestones.length, 0);

const getProgress = (student) => {
  const stageIndex = stages.findIndex((s) => s.id === student.stage);
  if (stageIndex === -1) return 0;

  const completedStages = stages.slice(0, stageIndex);
  const completedMilestones = completedStages.reduce((total, stage) => {
    const progress = student.milestoneProgress[stage.id] || [];
    return total + progress.filter(Boolean).length;
  }, 0);

  const currentStage = stages[stageIndex];
  const currentProgress = student.milestoneProgress[currentStage.id] || [];
  const progressCount = completedMilestones + currentProgress.filter(Boolean).length;
  return Math.round((progressCount / totalMilestones) * 100);
};

const getBadge = (student, milestoneIndex) => {
  const stage = stages.find((s) => s.id === student.stage);
  if (!stage) return '<span class="badge badge--pending">Queued</span>';
  const progress = student.milestoneProgress[stage.id] || [];
  const done = progress[milestoneIndex];
  if (done) return '<span class="badge badge--success">Done</span>';
  const nextIndex = progress.findIndex((item) => !item);
  if (nextIndex === milestoneIndex) return '<span class="badge badge--progress">In progress</span>';
  return '<span class="badge badge--pending">Queued</span>';
};

const renderStats = () => {
  const total = students.length;
  const byStage = stages.map((stage) => ({
    name: stage.name,
    count: students.filter((s) => s.stage === stage.id).length,
  }));
  const completion = total
    ? Math.round(students.reduce((sum, s) => sum + getProgress(s), 0) / total)
    : 0;

  elements.stats.innerHTML = `
    <div class="stat">
      <p class="muted">Total students</p>
      <div class="stat__value">${total}</div>
    </div>
    <div class="stat">
      <p class="muted">Average journey completion</p>
      <div class="stat__value">${completion}%</div>
    </div>
    ${byStage
      .map(
        (stage) => `
          <div class="stat">
            <p class="muted">${stage.name}</p>
            <div class="stat__value">${stage.count}</div>
          </div>
        `,
      )
      .join('')}
  `;
};

const renderStudent = (student) => {
  const node = elements.template.content.cloneNode(true);
  const card = node.querySelector('.student');
  card.dataset.id = student.id;

  card.querySelector('.student__grad').textContent = `Class of ${student.graduation}`;
  card.querySelector('.student__name').textContent = student.name;
  card.querySelector('.student__email').textContent = student.email;
  card.querySelector('.student__focus').textContent = student.focus || '—';
  card.querySelector('.student__notes').textContent = student.notes || 'No notes yet.';

  const stageSelect = card.querySelector('.stage-select');
  stageSelect.innerHTML = stages
    .map((stage) => `<option value="${stage.id}" ${student.stage === stage.id ? 'selected' : ''}>${stage.name}</option>`)
    .join('');
  stageSelect.addEventListener('change', (event) => {
    student.stage = event.target.value;
    persist();
    render();
  });

  const progress = getProgress(student);
  card.querySelector('.progress__fill').style.width = `${progress}%`;
  card.querySelector('.progress__label').textContent = `${progress}% journey complete`;

  const stage = stages.find((s) => s.id === student.stage);
  const milestones = card.querySelector('.milestones');
  milestones.innerHTML = stage.milestones
    .map(
      (milestone, index) => `
        <div class="milestone">
          <input type="checkbox" ${student.milestoneProgress[stage.id]?.[index] ? 'checked' : ''} data-index="${index}" />
          <div>
            <div class="milestone__name">${milestone}</div>
            ${getBadge(student, index)}
          </div>
        </div>
      `,
    )
    .join('');

  milestones.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    checkbox.addEventListener('change', (event) => {
      const idx = Number(event.target.dataset.index);
      const progress = student.milestoneProgress[stage.id] || Array(stage.milestones.length).fill(false);
      progress[idx] = event.target.checked;
      student.milestoneProgress[stage.id] = progress;
      persist();
      render();
    });
  });

  card.querySelector('.delete').addEventListener('click', () => {
    students = students.filter((s) => s.id !== student.id);
    persist();
    render();
  });

  return card;
};

const renderList = () => {
  const term = elements.search.value.toLowerCase();
  const selectedStage = elements.stageFilter.value;
  const filtered = students.filter((student) => {
    const matchesStage = selectedStage === 'all' || student.stage === selectedStage;
    const matchesTerm =
      student.name.toLowerCase().includes(term) ||
      student.focus.toLowerCase().includes(term) ||
      String(student.graduation).includes(term);
    return matchesStage && matchesTerm;
  });

  elements.students.innerHTML = '';
  filtered.forEach((student) => elements.students.appendChild(renderStudent(student)));
  elements.resultsCount.textContent = `${filtered.length} of ${students.length} students shown`;
};

const render = () => {
  renderStats();
  renderList();
};

const addStudent = (data) => {
  const newStudent = {
    id: crypto.randomUUID(),
    milestoneProgress: {},
    ...data,
  };

  stages.forEach((stage) => {
    newStudent.milestoneProgress[stage.id] = Array(stage.milestones.length).fill(false);
  });
  students.unshift(newStudent);
  persist();
  render();
};

const toCSV = () => {
  const header = [
    'Name',
    'Email',
    'Graduation',
    'Focus',
    'Stage',
    'Completion %',
    'Notes',
  ];

  const rows = students.map((student) => [
    student.name,
    student.email,
    student.graduation,
    student.focus,
    stages.find((s) => s.id === student.stage)?.name || student.stage,
    getProgress(student),
    student.notes?.replace(/\n/g, ' '),
  ]);

  return [header, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');
};

const downloadReport = () => {
  const csv = toCSV();
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'career-ready-report.csv';
  link.click();
  URL.revokeObjectURL(url);
};

const resetDemoData = () => {
  students = demoStudents.map((student) => ({ ...student, id: crypto.randomUUID() }));
  persist();
  render();
};

const bindEvents = () => {
  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    addStudent({
      name: data.name.trim(),
      email: data.email.trim(),
      focus: data.focus.trim(),
      graduation: Number(data.graduation),
      stage: data.stage,
      notes: data.notes.trim(),
    });
    event.target.reset();
    elements.stageSelect.value = stages[0].id;
  });

  elements.search.addEventListener('input', renderList);
  elements.stageFilter.addEventListener('change', renderList);
  elements.demoData.addEventListener('click', resetDemoData);
  elements.download.addEventListener('click', downloadReport);
};

renderStageOptions();
bindEvents();
render();
