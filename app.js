import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, onValue, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyDy18QuWkFsp69GZxLQEr0eSc6_C7cwp9Y",
  authDomain: "encuesta-noche-ceia-2026.firebaseapp.com",
  databaseURL: "https://encuesta-noche-ceia-2026-default-rtdb.firebaseio.com",
  projectId: "encuesta-noche-ceia-2026",
  storageBucket: "encuesta-noche-ceia-2026.firebasestorage.app",
  messagingSenderId: "846745141431",
  appId: "1:846745141431:web:98662bb0988d7c7c574d32"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const responsesRef = ref(db, "responses");
const suggestionsRef = ref(db, "suggestions");

// --- Application State ---
let currentStepIndex = 0; // 0: Welcome, 1: Block 1, 2: Block 2, 3: Block 3, 4: Block 4, 5: Success
const TOTAL_BLOCKS = 4;
let responsesList = [];
let suggestionsList = [];

// --- Sample Responses for Simulation ---
const SAMPLE_RESPONSES = [
  {
    timestamp: "28/05/2026 22:15:30",
    identity: "Marta R. (Docentes)",
    q1_motivation: "El compañerismo y la unión del equipo",
    q2_superpowers: "La velocidad de resolución cuando falla algún sistema central sin necesidad de supervisión.",
    q3_friction: "La lentitud para recibir soporte informático crítico cuando hay cortes de servicio pasadas las 12 de la noche.",
    q3b_needs: "Mejorar la conectividad Wi-Fi de alta velocidad en las salas comunes y salas de clases.",
    q4_tools: 3,
    q5_magic_wand: "Establecer una guardia mínima técnica de IT remota de guardia activa para la jornada nocturna.",
    q6_team_strengths: "Fortalecer la capacitación colectiva en el uso de herramientas de aprendizaje híbrido y digital.",
    q7_future_vision: "Visualizo un entorno donde los procesos críticos no se detengan por falta de firmas administrativas.",
    q8_risks: ["Falta de comunicación institucional", "Falta de capacitación adaptada"],
    q9_influence: 4,
    q10_final_pulse: "¡Hacer esta encuesta ya es un gran paso! Agradezco mucho que nos tomen en cuenta de verdad."
  },
  {
    timestamp: "28/05/2026 22:40:12",
    identity: "Anónimo (Asistentes de la educación)",
    q1_motivation: "El impacto directo en los estudiantes/usuarios",
    q2_superpowers: "La empatía y la gran paciencia que tenemos con los usuarios nerviosos a altas horas.",
    q3_friction: "Falta de iluminación en el estacionamiento secundario, lo que genera sensación de inseguridad al salir.",
    q3b_needs: "Instalación de cámaras de seguridad y mayor presencia de personal de vigilancia en los accesos.",
    q4_tools: 4,
    q5_magic_wand: "Una bitácora digital compartida y automatizada para traspasar novedades al turno mañana.",
    q6_team_strengths: "Coordinar talleres de primeros auxilios y manejo de emergencias a nivel de todo el personal nocturno.",
    q7_future_vision: "Tener mayor integración con las decisiones generales y sentirnos valorados por igual.",
    q8_risks: ["Temas de seguridad física/entorno"],
    q9_influence: 3,
    q10_final_pulse: "Mejorar la iluminación externa es urgente."
  },
  {
    timestamp: "29/05/2026 01:10:05",
    identity: "Carlos Gómez (Docentes)",
    q1_motivation: "La flexibilidad horaria y conciliación",
    q2_superpowers: "Solidaridad absoluta. Si alguien se enferma o tiene un problema, nos cubrimos sin dudar.",
    q3_friction: "La cafetería y los expendedores automáticos a menudo están vacíos o no funcionan durante la noche.",
    q3b_needs: "Un sistema de abastecimiento confiable de alimentos saludables para el personal del turno de la noche.",
    q4_tools: 2,
    q5_magic_wand: "Un convenio de catering nocturno saludable o reposición garantizada de máquinas.",
    q6_team_strengths: "Desarrollar capacidades en análisis de datos y sistematización de reportes internos.",
    q7_future_vision: "Procesos 100% digitalizados sin papeles innecesarios que atrasen el flujo.",
    q8_risks: ["Excesiva carga laboral / Agotamiento", "Falta de comunicación institucional"],
    q9_influence: 5,
    q10_final_pulse: "El equipo es excelente, solo necesitamos herramientas actualizadas."
  },
  {
    timestamp: "29/05/2026 02:30:15",
    identity: "Anónimo (Asistentes de la educación)",
    q1_motivation: "El compañerismo y la unión del equipo",
    q2_superpowers: "Capacidad de autogestión y tranquilidad ante picos de demanda.",
    q3_friction: "El software de registro es muy lento y requiere 6 clicks para tareas sencillas que podrían automatizarse.",
    q3b_needs: "Actualización de las licencias de software y renovación de equipos informáticos obsoletos.",
    q4_tools: 3,
    q5_magic_wand: "Simplificar la interfaz de registro de usuarios reduciendo campos obligatorios redundantes.",
    q6_team_strengths: "Fortalecer la comunicación inter-turnos para un traspaso de información más fluido.",
    q7_future_vision: "Expectativa de recibir al menos una capacitación técnica formal al año.",
    q8_risks: ["Falta de capacitación adaptada"],
    q9_influence: 2,
    q10_final_pulse: "Sentimos que a veces las capacitaciones solo se programan por la mañana."
  },
  {
    timestamp: "29/05/2026 03:45:00",
    identity: "Lucía Pérez (Asistentes de la educación)",
    q1_motivation: "La autonomía y tranquilidad del horario nocturno",
    q2_superpowers: "Mantener la calma en emergencias operativas extremas.",
    q3_friction: "La temperatura en el bloque B de oficinas es sumamente fría y el termostato no se puede regular desde aquí.",
    q3b_needs: "Mantenimiento preventivo de los sistemas de calefacción y climatización de las salas de trabajo.",
    q4_tools: 4,
    q5_magic_wand: "Permitir regulación local de temperatura o proveer climatización adecuada.",
    q6_team_strengths: "Implementar protocolos claros de resolución de incidencias complejas sin depender de jefaturas de día.",
    q7_future_vision: "Tener canales fluidos de comunicación con la directiva sin tanta burocracia.",
    q8_risks: ["Falta de comunicación institucional"],
    q9_influence: 3,
    q10_final_pulse: "El equipo nocturno tiene una vibra genial, cuidemos al personal."
  }
];

// --- Initializer ---
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  
  // Listen for real-time changes in Firebase database (Survey)
  onValue(responsesRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      responsesList = Object.keys(data).map(key => data[key]);
    } else {
      responsesList = [];
    }
    updateDashboardMetrics();
  });

  // Listen for real-time changes in Firebase database (Suggestions)
  onValue(suggestionsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      suggestionsList = Object.keys(data).map(key => data[key]);
    } else {
      suggestionsList = [];
    }
    updateDashboardMetrics();
  });
});

// --- Event Listeners Setup ---
function setupEventListeners() {
  // Navigation & Survey initiation
  document.getElementById("btn-start-survey").addEventListener("click", () => {
    goToStep(1);
  });

  document.getElementById("btn-print-survey").addEventListener("click", () => {
    window.print();
  });

  // Suggestions flow triggers
  document.getElementById("btn-start-suggestions").addEventListener("click", () => {
    document.getElementById("survey-welcome").classList.remove("active");
    document.getElementById("suggestions-form").style.display = "block";
    currentStepIndex = 99; // custom state
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.getElementById("btn-back-suggestions").addEventListener("click", () => {
    document.getElementById("suggestions-form").style.display = "none";
    document.getElementById("survey-welcome").classList.add("active");
    currentStepIndex = 0;
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.getElementById("suggestions-form").addEventListener("submit", (e) => {
    e.preventDefault();
    submitSuggestions();
  });

  document.getElementById("btn-next-step").addEventListener("click", () => {
    if (validateCurrentStep()) {
      goToStep(currentStepIndex + 1);
    }
  });

  document.getElementById("btn-prev-step").addEventListener("click", () => {
    goToStep(currentStepIndex - 1);
  });

  document.getElementById("survey-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (validateCurrentStep()) {
      submitSurvey();
    }
  });

  // Success screen redirection
  document.getElementById("btn-restart-survey").addEventListener("click", () => {
    resetSurveyForm();
    goToStep(0);
  });

  document.getElementById("btn-view-results-success").addEventListener("click", () => {
    toggleView("dashboard");
  });

  // View toggling (Survey <-> Dashboard)
  document.getElementById("btn-toggle-view").addEventListener("click", () => {
    const isSurveyActive = document.getElementById("survey-section").style.display !== "none";
    toggleView(isSurveyActive ? "dashboard" : "survey");
  });

  // Clear Database
  document.getElementById("btn-clear-data").addEventListener("click", () => {
    if (confirm("⚠️ ¿Estás seguro de que deseas eliminar permanentemente TODAS las respuestas de la base de datos? Esta acción es irreversible.")) {
      Promise.all([set(responsesRef, null), set(suggestionsRef, null)])
        .then(() => {
          alert("✅ Base de datos limpiada con éxito.");
        })
        .catch((error) => {
          console.error("Error al limpiar base de datos:", error);
          alert("❌ Error al limpiar la base de datos. Verifica la conexión.");
        });
    }
  });

  // Simulation of responses
  document.getElementById("btn-simulate-data").addEventListener("click", () => {
    simulateData();
  });

  // Open-ended response filter
  document.getElementById("select-filter-question").addEventListener("change", () => {
    renderOpenResponses();
  });

  // Exports
  document.getElementById("btn-export-csv").addEventListener("click", () => {
    exportToCSV();
  });

  document.getElementById("btn-export-json").addEventListener("click", () => {
    exportToJSON();
  });

  // Character counters
  setupCharCounter("q3_friction", "q3-count");

  // "Otro" Input options logic
  setupOtherOptionLogic("q1_motivation", "q1_motivation_other", "q1-option-other");
  setupOtherOptionLogicCheckbox("q8_risks", "q8_risks_other", "q8-option-other");

  // Highlight active input visual feedback
  const inputs = document.querySelectorAll(".input-text, .input-textarea, .input-select");
  inputs.forEach(input => {
    input.addEventListener("focus", (e) => {
      e.target.closest(".question-card")?.classList.add("active-input");
    });
    input.addEventListener("blur", (e) => {
      e.target.closest(".question-card")?.classList.remove("active-input");
    });
  });
}

// --- Char counter helper ---
function setupCharCounter(inputId, counterId) {
  const input = document.getElementById(inputId);
  const counter = document.getElementById(counterId);
  if (input && counter) {
    input.addEventListener("input", () => {
      counter.textContent = input.value.length;
    });
  }
}

// --- "Otro" options helper (Radios) ---
function setupOtherOptionLogic(radioName, otherInputId, otherOptionLabelId) {
  const radios = document.getElementsByName(radioName);
  const otherInputWrap = document.getElementById(otherInputId + "-container");
  const otherInput = document.getElementById(otherInputId);

  Array.from(radios).forEach(radio => {
    radio.addEventListener("change", () => {
      if (radio.value === "Otro" && radio.checked) {
        otherInputWrap.style.display = "block";
        otherInput.required = true;
        otherInput.focus();
      } else {
        otherInputWrap.style.display = "none";
        otherInput.required = false;
      }
    });
  });
}

// --- "Otro" options helper (Checkboxes) ---
function setupOtherOptionLogicCheckbox(checkboxName, otherInputId, otherOptionLabelId) {
  const checkboxes = document.getElementsByName(checkboxName);
  const otherInputWrap = document.getElementById(otherInputId + "-container");
  const otherInput = document.getElementById(otherInputId);

  Array.from(checkboxes).forEach(cb => {
    cb.addEventListener("change", () => {
      if (cb.value === "Otro") {
        if (cb.checked) {
          otherInputWrap.style.display = "block";
          otherInput.required = true;
          otherInput.focus();
        } else {
          otherInputWrap.style.display = "none";
          otherInput.required = false;
        }
      }
    });
  });
}

// --- Toggle between wizard survey and admin dashboard ---
function toggleView(target) {
  const surveySec = document.getElementById("survey-section");
  const dashboardSec = document.getElementById("dashboard-section");
  const toggleBtn = document.getElementById("btn-toggle-view");

  if (target === "dashboard") {
    surveySec.style.display = "none";
    dashboardSec.style.display = "block";
    toggleBtn.innerHTML = '<span class="icon">✏️</span> <span class="text">Ir a la Encuesta</span>';
    toggleBtn.title = "Volver a realizar o completar la encuesta";
    updateDashboardMetrics();
  } else {
    surveySec.style.display = "block";
    dashboardSec.style.display = "none";
    toggleBtn.innerHTML = '<span class="icon">📊</span> <span class="text">Ver Resultados</span>';
    toggleBtn.title = "Ver Resultados / Panel Administrador";
  }
  // Scroll smoothly to top
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// --- Survey Wizard Steps Navigation ---
function goToStep(stepIndex) {
  currentStepIndex = stepIndex;

  // Active steps hide/show
  const welcomeStep = document.getElementById("survey-welcome");
  const formElement = document.getElementById("survey-form");
  const successStep = document.getElementById("survey-success");
  const blockSteps = [
    document.getElementById("step-block-1"),
    document.getElementById("step-block-2"),
    document.getElementById("step-block-3"),
    document.getElementById("step-block-4")
  ];

  // Hide everything first
  welcomeStep.classList.remove("active");
  formElement.style.display = "none";
  successStep.style.display = "none";
  blockSteps.forEach(block => block.classList.remove("active"));

  if (stepIndex === 0) {
    welcomeStep.classList.add("active");
  } else if (stepIndex >= 1 && stepIndex <= TOTAL_BLOCKS) {
    formElement.style.display = "block";
    blockSteps[stepIndex - 1].classList.add("active");
    
    // Update Progress Bar
    const progressPercent = Math.round(((stepIndex - 1) / TOTAL_BLOCKS) * 100);
    document.getElementById("survey-progress-bar").style.width = `${progressPercent}%`;
    document.getElementById("survey-step-percentage").textContent = `${progressPercent}% completado`;
    
    const blockTitles = [
      "Bloque 1 de 4: Fortalezas",
      "Bloque 2 de 4: Necesidades",
      "Bloque 3 de 4: Oportunidades",
      "Bloque 4 de 4: Inquietudes"
    ];
    document.getElementById("survey-step-title").textContent = blockTitles[stepIndex - 1];

    // Navigation buttons visibility
    const prevBtn = document.getElementById("btn-prev-step");
    const nextBtn = document.getElementById("btn-next-step");
    const submitBtn = document.getElementById("btn-submit-survey");

    prevBtn.style.display = "inline-flex";
    if (stepIndex === TOTAL_BLOCKS) {
      nextBtn.style.display = "none";
      submitBtn.style.display = "inline-flex";
    } else {
      nextBtn.style.display = "inline-flex";
      submitBtn.style.display = "none";
    }
  } else if (stepIndex > TOTAL_BLOCKS) {
    successStep.style.display = "block";
    document.getElementById("survey-progress-bar").style.width = "100%";
    document.getElementById("survey-step-percentage").textContent = "100% completado";
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// --- Validation helper for active block ---
function validateCurrentStep() {
  if (currentStepIndex === 0) return true;

  const currentBlockId = `step-block-${currentStepIndex}`;
  const blockContainer = document.getElementById(currentBlockId);
  const requiredInputs = blockContainer.querySelectorAll("[required]");
  let isValid = true;

  // Clear previous error styles
  blockContainer.querySelectorAll(".question-card").forEach(card => {
    card.style.borderColor = "";
    card.style.boxShadow = "";
  });

  requiredInputs.forEach(input => {
    let hasValue = false;

    if (input.type === "radio") {
      // Check if any radio in the group is checked
      const name = input.name;
      const checked = blockContainer.querySelector(`input[name="${name}"]:checked`);
      hasValue = !!checked;
    } else if (input.type === "checkbox") {
      // Check if at least one checkbox is checked in the group
      const name = input.name;
      const checked = blockContainer.querySelector(`input[name="${name}"]:checked`);
      hasValue = !!checked;
    } else {
      // Standard input/textarea
      hasValue = input.value.trim() !== "";
    }

    if (!hasValue) {
      isValid = false;
      const card = input.closest(".question-card");
      if (card) {
        card.style.borderColor = "#ef4444";
        card.style.boxShadow = "0 0 10px rgba(239, 68, 68, 0.2)";
      }
    }
  });

  if (!isValid) {
    // Scroll to the first invalid card
    const firstInvalid = blockContainer.querySelector('[style*="border-color"]');
    if (firstInvalid) {
      firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  return isValid;
}

// --- Gather inputs and submit ---
function submitSurvey() {
  const form = document.getElementById("survey-form");
  const formData = new FormData(form);

  // Parse fields
  let q1_val = formData.get("q1_motivation");
  if (q1_val === "Otro") {
    q1_val = document.getElementById("q1_motivation_other").value.trim() || "Otro";
  }

  const q2_val = document.getElementById("q2_superpowers").value.trim();
  const q3_val = document.getElementById("q3_friction").value.trim();
  const q3b_val = document.getElementById("q3b_needs").value.trim();
  const q4_val = parseInt(formData.get("q4_tools"));
  const q5_val = document.getElementById("q5_magic_wand").value.trim();
  const q6_val = document.getElementById("q6_team_strengths").value.trim();
  const q7_val = document.getElementById("q7_future_vision").value.trim();

  // Handle checkboxes for q8
  const q8_checked = [];
  form.querySelectorAll('input[name="q8_risks"]:checked').forEach(cb => {
    if (cb.value === "Otro") {
      const otherVal = document.getElementById("q8_risks_other").value.trim();
      if (otherVal) q8_checked.push(otherVal);
    } else {
      q8_checked.push(cb.value);
    }
  });

  const q9_val = parseInt(formData.get("q9_influence"));
  const q10_val = document.getElementById("q10_final_pulse").value.trim();
  const raw_identity = document.getElementById("user_identity").value.trim();
  const category_val = document.getElementById("user_category").value;
  const identity_val = `${raw_identity} (${category_val})`;

  // Create response object
  const now = new Date();
  const timestampStr = `${pad(now.getDate())}/${pad(now.getMonth()+1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const responseObj = {
    timestamp: timestampStr,
    identity: identity_val,
    q1_motivation: q1_val,
    q2_superpowers: q2_val,
    q3_friction: q3_val,
    q3b_needs: q3b_val,
    q4_tools: q4_val,
    q5_magic_wand: q5_val,
    q6_team_strengths: q6_val,
    q7_future_vision: q7_val,
    q8_risks: q8_checked,
    q9_influence: q9_val,
    q10_final_pulse: q10_val
  };

  // Add to Firebase Realtime Database
  push(responsesRef, responseObj)
    .then(() => {
      // Go to success step
      goToStep(5);
    })
    .catch((error) => {
      console.error("Error al guardar en Firebase:", error);
      // Fallback: add locally to proceed anyway
      responsesList.push(responseObj);
      goToStep(5);
    });
}

// --- Gather suggestions and submit ---
function submitSuggestions() {
  const form = document.getElementById("suggestions-form");
  const identity = document.getElementById("sug_identity").value.trim();
  const category = document.getElementById("sug_category").value;
  const questionA = document.getElementById("sug_question_a").value.trim();
  const questionB = document.getElementById("sug_question_b").value.trim();

  const now = new Date();
  const timestampStr = `${pad(now.getDate())}/${pad(now.getMonth()+1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const suggestionObj = {
    timestamp: timestampStr,
    identity: `${identity} (${category})`,
    sug_question_a: questionA,
    sug_question_b: questionB
  };

  // Push to Firebase suggestionsRef
  push(suggestionsRef, suggestionObj)
    .then(() => {
      form.reset();
      document.getElementById("suggestions-form").style.display = "none";
      document.getElementById("survey-welcome").classList.add("active");
      currentStepIndex = 0;
      goToStep(5);
    })
    .catch((error) => {
      console.error("Error al guardar sugerencia en Firebase:", error);
      // Fallback
      suggestionsList.push(suggestionObj);
      form.reset();
      document.getElementById("suggestions-form").style.display = "none";
      document.getElementById("survey-welcome").classList.add("active");
      currentStepIndex = 0;
      goToStep(5);
    });
}

function pad(num) {
  return num.toString().padStart(2, '0');
}

// --- Reset the Survey Form completely ---
function resetSurveyForm() {
  const form = document.getElementById("survey-form");
  form.reset();
  
  // Hide custom "Otro" boxes
  document.getElementById("q1_motivation_other-container").style.display = "none";
  document.getElementById("q8_risks_other-container").style.display = "none";
  document.getElementById("q3-count").textContent = "0";

  // Clear visual states
  form.querySelectorAll(".question-card").forEach(card => {
    card.style.borderColor = "";
    card.style.boxShadow = "";
  });
}

// --- Sample Suggestions for Simulation ---
const SAMPLE_SUGGESTIONS = [
  {
    timestamp: "29/05/2026 10:15:00",
    identity: "Patricia Soto (Asistentes de la educación)",
    sug_question_a: "Falta personal de limpieza para el comedor nocturno después de la cena.",
    sug_question_b: "Establecer roles rotativos o contratar un servicio de aseo básico por horas pasadas las 10 PM."
  },
  {
    timestamp: "29/05/2026 12:30:00",
    identity: "Marcos Retamal (Docentes)",
    sug_question_a: "Algunos proyectores en el segundo piso parpadean constantemente.",
    sug_question_b: "Hacer una revisión técnica preventiva mensual de los laboratorios y aulas durante el fin de semana."
  }
];

// --- Simulate Sample Responses ---
function simulateData() {
  // Push each sample response to Firebase Realtime Database (Survey)
  SAMPLE_RESPONSES.forEach(r => {
    push(responsesRef, r);
  });

  // Push sample suggestions
  SAMPLE_SUGGESTIONS.forEach(s => {
    push(suggestionsRef, s);
  });
  
  // Flash effect on total responses metric to show change
  const totalEl = document.getElementById("stat-total-responses");
  totalEl.style.transform = "scale(1.2)";
  totalEl.style.color = "var(--accent-cyan)";
  setTimeout(() => {
    totalEl.style.transform = "";
    totalEl.style.color = "";
  }, 600);
}

// --- Recalculate Dashboard Stats and Re-render SVG Charts ---
function updateDashboardMetrics() {
  const totalResponses = responsesList.length;
  document.getElementById("stat-total-responses").textContent = totalResponses;

  if (totalResponses === 0) {
    document.getElementById("stat-avg-resources").textContent = "0.0 / 5";
    document.getElementById("stat-avg-influence").textContent = "0.0 / 5";
    
    // Set no data placeholders
    document.getElementById("chart-motivation-container").innerHTML = `<div class="no-data-placeholder">Completa encuestas o simula datos para ver este gráfico</div>`;
    document.getElementById("chart-risks-container").innerHTML = `<div class="no-data-placeholder">Completa encuestas o simula datos para ver este gráfico</div>`;
    document.getElementById("dashboard-open-responses-list").innerHTML = `<div class="no-data-placeholder">Completa encuestas o simula datos para explorar el buzón de respuestas</div>`;
    return;
  }

  // Calculate averages
  let sumResources = 0;
  let sumInfluence = 0;
  responsesList.forEach(r => {
    sumResources += r.q4_tools || 0;
    sumInfluence += r.q9_influence || 0;
  });

  const avgResources = (sumResources / totalResponses).toFixed(1);
  const avgInfluence = (sumInfluence / totalResponses).toFixed(1);

  document.getElementById("stat-avg-resources").textContent = `${avgResources} / 5`;
  document.getElementById("stat-avg-influence").textContent = `${avgInfluence} / 5`;

  // Draw Charts & Tables
  renderMotivationChart();
  renderRisksChart();
  renderOpenResponses();
}

// --- Render SVG Chart: El Motor del Equipo (Motivation Options) ---
function renderMotivationChart() {
  const container = document.getElementById("chart-motivation-container");
  
  // Compute counts
  const counts = {};
  responsesList.forEach(r => {
    const val = r.q1_motivation;
    if (val) {
      counts[val] = (counts[val] || 0) + 1;
    }
  });

  // Sort values descending
  const sortedData = Object.keys(counts).map(key => ({
    label: key,
    count: counts[key]
  })).sort((a, b) => b.count - a.count);

  if (sortedData.length === 0) return;

  const maxCount = Math.max(...sortedData.map(d => d.count));
  const total = responsesList.length;

  // Generate SVG Code
  let svgHeight = sortedData.length * 45 + 20;
  let svgHTML = `<svg class="svg-chart" viewBox="0 0 500 ${svgHeight}" width="100%">`;

  sortedData.forEach((item, index) => {
    const y = index * 45 + 15;
    const barMaxWidth = 300;
    const barWidth = (item.count / maxCount) * barMaxWidth;
    const percentage = Math.round((item.count / total) * 100);
    
    // Label truncation
    let displayLabel = item.label;
    if (displayLabel.length > 25) displayLabel = displayLabel.substring(0, 23) + "...";

    svgHTML += `
      <!-- Label -->
      <text x="10" y="${y + 16}" class="chart-label-text" title="${item.label}">${displayLabel}</text>
      
      <!-- Track -->
      <rect x="160" y="${y}" width="${barMaxWidth}" height="20" rx="6" fill="rgba(255,255,255,0.03)" />
      
      <!-- Bar -->
      <rect x="160" y="${y}" width="${barWidth}" height="20" rx="6" fill="url(#motGrad)" class="chart-bar-rect" />
      
      <!-- Value badge -->
      <text x="${160 + barWidth + 10}" y="${y + 14}" class="chart-bar-text" font-weight="600">${item.count} (${percentage}%)</text>
    `;
  });

  // Gradients definition
  svgHTML += `
    <defs>
      <linearGradient id="motGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="var(--accent-primary)" />
        <stop offset="100%" stop-color="var(--accent-cyan)" />
      </linearGradient>
    </defs>
  `;

  svgHTML += `</svg>`;
  container.innerHTML = svgHTML;
}

// --- Render SVG Chart: Radar de Riesgos e Inquietudes (Checkboxes) ---
function renderRisksChart() {
  const container = document.getElementById("chart-risks-container");
  
  // Compute counts (Since it's checkboxes, an answer can have multiple risks)
  const counts = {};
  responsesList.forEach(r => {
    const risks = r.q8_risks;
    if (risks && Array.isArray(risks)) {
      risks.forEach(risk => {
        counts[risk] = (counts[risk] || 0) + 1;
      });
    }
  });

  // Sort values descending
  const sortedData = Object.keys(counts).map(key => ({
    label: key,
    count: counts[key]
  })).sort((a, b) => b.count - a.count);

  if (sortedData.length === 0) {
    container.innerHTML = `<div class="no-data-placeholder">Ningún riesgo ha sido reportado todavía</div>`;
    return;
  }

  const maxCount = Math.max(...sortedData.map(d => d.count));
  const total = responsesList.length;

  let svgHeight = sortedData.length * 45 + 20;
  let svgHTML = `<svg class="svg-chart" viewBox="0 0 500 ${svgHeight}" width="100%">`;

  sortedData.forEach((item, index) => {
    const y = index * 45 + 15;
    const barMaxWidth = 300;
    const barWidth = (item.count / maxCount) * barMaxWidth;
    const percentage = Math.round((item.count / total) * 100);

    let displayLabel = item.label;
    if (displayLabel.length > 25) displayLabel = displayLabel.substring(0, 23) + "...";

    svgHTML += `
      <!-- Label -->
      <text x="10" y="${y + 16}" class="chart-label-text" title="${item.label}">${displayLabel}</text>
      
      <!-- Track -->
      <rect x="160" y="${y}" width="${barMaxWidth}" height="20" rx="6" fill="rgba(255,255,255,0.03)" />
      
      <!-- Bar -->
      <rect x="160" y="${y}" width="${barWidth}" height="20" rx="6" fill="url(#riskGrad)" class="chart-bar-rect" />
      
      <!-- Value badge -->
      <text x="${160 + barWidth + 10}" y="${y + 14}" class="chart-bar-text" font-weight="600">${item.count} (${percentage}%)</text>
    `;
  });

  svgHTML += `
    <defs>
      <linearGradient id="riskGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="var(--accent-secondary)" />
        <stop offset="100%" stop-color="#ef4444" />
      </linearGradient>
    </defs>
  `;

  svgHTML += `</svg>`;
  container.innerHTML = svgHTML;
}

// --- Render Open Responses with Dropdown Filters ---
function renderOpenResponses() {
  const container = document.getElementById("dashboard-open-responses-list");
  const activeQuestionKey = document.getElementById("select-filter-question").value;

  // Filter keys maps
  const keyMap = {
    q2: { prop: "q2_superpowers", label: "Mayor Fortaleza" },
    q3: { prop: "q3_friction", label: "Fricción Diaria" },
    q3b: { prop: "q3b_needs", label: "Carencias y Necesidades" },
    q5: { prop: "q5_magic_wand", label: "Propuesta de Varita Mágica" },
    q6: { prop: "q6_team_strengths", label: "Fortalecimiento Colectivo" },
    q7: { prop: "q7_future_vision", label: "Expectativa de Futuro" },
    q10: { prop: "q10_final_pulse", label: "Comentario Extra" },
    sug_a: { prop: "sug_question_a", label: "Buzón: Inquietud Urgente" },
    sug_b: { prop: "sug_question_b", label: "Buzón: Sugerencia o Propuesta" }
  };

  const currentMap = keyMap[activeQuestionKey];
  const isSuggestion = activeQuestionKey.startsWith("sug_");
  const listToFilter = isSuggestion ? suggestionsList : responsesList;

  const listItems = listToFilter.filter(r => r[currentMap.prop] && r[currentMap.prop].trim() !== "");

  if (listItems.length === 0) {
    container.innerHTML = `<div class="no-data-placeholder">No hay respuestas escritas para esta pregunta</div>`;
    return;
  }

  let listHTML = "";
  // Render reversed (newest first)
  [...listItems].reverse().forEach(item => {
    const author = item.identity ? item.identity : "Anónimo";
    listHTML += `
      <div class="response-bubble">
        <p class="response-text">"${escapeHtml(item[currentMap.prop])}"</p>
        <div class="response-meta">
          <span class="response-author">👤 ${escapeHtml(author)}</span>
          <span class="response-time">📅 ${item.timestamp}</span>
        </div>
      </div>
    `;
  });

  container.innerHTML = listHTML;
}

// --- HTML Escape Helper ---
function escapeHtml(text) {
  if (!text) return "";
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.toString().replace(/[&<>"']/g, function(m) { return map[m]; });
}

// --- Export to CSV / Excel ---
function exportToCSV() {
  if (responsesList.length === 0) {
    alert("No hay datos para exportar. Por favor completa la encuesta o simula datos primero.");
    return;
  }

  // Headers (Spanish)
  const headers = [
    "Marca de Tiempo", "Identificación", "Q1: ¿Qué destaca al equipo?", "Q2: Fortaleza / Superpoder",
    "Q3: Obstáculo / Fricción", "Q3.5: Carencias / Necesidades", "Q4: Evaluación Herramientas (1-5)",
    "Q5: Propuesta de Varita Mágica", "Q6: Fortalecimiento Colectivo", "Q7: Expectativa fin de año",
    "Q8: Inquietudes / Amenazas", "Q9: Capacidad de Influencia (1-5)", "Q10: Espacio Libre / Comentario"
  ];

  let csvContent = "\uFEFF"; // UTF-8 BOM for Excel compatibility
  csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(",") + "\n";

  responsesList.forEach(r => {
    const row = [
      r.timestamp || "",
      r.identity || "Anónimo",
      r.q1_motivation || "",
      r.q2_superpowers || "",
      r.q3_friction || "",
      r.q3b_needs || "",
      r.q4_tools || "",
      r.q5_magic_wand || "",
      r.q6_team_strengths || "",
      r.q7_future_vision || "",
      (r.q8_risks || []).join(" | "),
      r.q9_influence || "",
      r.q10_final_pulse || ""
    ];
    csvContent += row.map(v => `"${v.toString().replace(/"/g, '""')}"`).join(",") + "\n";
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "Encuesta_Jornada_Nocturna.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// --- Export to JSON ---
function exportToJSON() {
  if (responsesList.length === 0) {
    alert("No hay datos para exportar. Por favor completa la encuesta o simula datos primero.");
    return;
  }

  const blob = new Blob([JSON.stringify(responsesList, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "Encuesta_Jornada_Nocturna.json");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
