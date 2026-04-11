// Language translations for the site
// Note: English content is now sourced directly from index.html
// This file only contains Spanish translations
window.translations = {
  es: {
    // Header
    title: "Juan Vásquez",
    cv: "cv académico",
    resume: "résumé professional",
    updated: "Actualizado",
    
    // Navigation
    contents: "Contenidos",
    intro: "intro",
    contact: "contacto",
    acpublications: "publicaciones académicas",
    teaching: "enseñanza",
    professionalWork: "trabajo profesional",
    otherWork: "otro trabajo",
    extra: "?",
    
    // Intro section
    introText: `Soy Juan Vásquez (él), estudiante de doctorado en Ciencias de la Computación en la Universidad de Colorado Boulder.`,
    introText2: `Actualmente trabajo en análisis conversacional siguiendo el trabajo de <a href="https://tisjune.github.io/">Dra. Justine Zhang.</a>`,
    introText3: `Durante mi maestría (en IA), trabajé en detección de lenguaje heteronormativo y detección de discurso de odio en español mexicano bajo la supervisión de <a href="https://scholar.google.com/citations?user=RXWYz10AAAAJ&hl=es">Dra. Gemma Bel Enguix</a> y <a href="https://www.fciencias.unam.mx/directorio/34006">Dra. Karla Ramírez Pulido</a>.`,
    introText4: "En mi tiempo libre disfruto jugando J-RPGs, viendo películas y leyendo literatura contemporánea latinoamericana.",

    // Contact section
    contactText: "Puedes contactarme por correo electrónico en juanmvs[at]proton.me",
    contactSocials: "También puedes encontrar mis redes sociales aquí:",
    
    // Teaching section
    teachingHeaders: {
      course: "Curso",
      place: "Lugar",
      period: "Periodo",
      description: "Descripción"
    },
    teachingRoles: {
      ta: "Asistente de cátedra",
      instructor: "Instructor principal"
    },
    courseMaterials: "Materiales creados para el curso disponibles",
    here: "aquí",
    spanish: "(en español)",
    
    // Professional work section
    graduateResearcher: "Investigador de posgrado",
    conversationalAgentConsultant: "Consultor de agentes conversacionales",

    // Graduate Researcher bullets
    grBullet1: "Diseñé un pipeline de análisis de podcasts acelerado por GPU que combina transcripción WhisperX, diarización pyannote.audio y 8 modelos transformer para detección multi-etiqueta de discurso de odio, logrando 4.5x aceleración mediante optimización torch.compile y cuantización BFloat16 en GPUs NVIDIA H100/A100.",
    grBullet2: "Construí un sistema de identificación de hablantes de 5 etapas usando spaCy NER, análisis cross-episodio y clasificación de roles basada en LLM para reemplazar automáticamente IDs de hablantes con nombres reales en más de 21 programas de podcast.",
    grBullet3: "Implementé detección de patrones de deshumanización basada en embeddings semánticos usando sentence transformers, logrando 50-100x aceleración en GPU.",
    grBullet4: "Desarrollé una arquitectura neurosimbólica que combina Abstract Meaning Representations (AMR) con Graph Neural Networks para análisis interpretable de clasificación de texto.",
    grBullet5: "Procesé 11,000 documentos a través de pipelines de parsing AMR para construir conjuntos de datos de grafos semánticos para entrenamiento de GNN.",
    grBullet6: "Evalué arquitecturas GAT, GCN y GraphSAGE en grafos derivados de AMR, estableciendo líneas base para comprensión neurosimbólica de documentos.",

    // Conversational Agent Consultant bullets
    cacBullet1: "Construí un agente conversacional impulsado por Llama3.3 que proporciona soporte confidencial 24/7 a sobrevivientes de violencia laboral, conectando usuarios con recursos legales y servicios de intervención en crisis.",
    cacBullet2: "Diseñé e implementé un pipeline RAG logrando 100% de precisión en recuperación de fuentes y 93% de cobertura de palabras clave en consultas legales de dominio específico.",
    cacBullet3: "Colaboré con expertos legales para curar una base de conocimiento de protocolos de apoyo a víctimas informados por trauma, alineados con marcos de justicia restaurativa.",

    // Other work section
    organizerRole: "Organizador",
    attendingStudent: "Estudiante asistente",
    programCommittee: "Miembro del comité de programa",
    presenter: "Presentador",
    keynoteSpeaker: "Ponente principal",
    guestSpeaker: "Ponente invitado",
    firstPlace: "Primer lugar",
    talk: "Charla",
    
    // Extra section
    researchers: "INVESTIGADORXS",
    researchersIntro: "Estxs son algunxs investigadorxs cuyo trabajo sigo de cerca y que encuentro muy interesante. Checa su trabajo si quieres aprender más sobre varias áreas en Ciencias de la Computación :)",
    
    // Research areas
    compAnalConv: "→ análisis computacional de conversaciones",
    compSocSci: "→ ciencias sociales computacionales",
    dataProtection: "protección de datos y tecnología, gobernanza, privacidad y gobernanza",
    deepfakes: "→ deepfakes y detección de contenido generado por llm",
    ethics: "→ ética en ia y pln",
    formalLanguages: "→ lenguajes formales y redes neuronales",
    formalSemantics: "→ semántica formal / representaciones semánticas",
    grounded: "→ adquisición de lenguaje fundamentado",
    compLinguistics: "→ lingüística / lingüística computacional",
    llmDesign: "→ diseño, evaluación y análisis de llm",
    llmFairness: "→ equidad de llm y eliminación de sesgos",
    logic: "→ lógica / demostración de teoremas",
    neurosymbolic: "→ pln neurosimbólico",
    probabilisticProgramming: "→ programación probabilística",
    ppls: "→ lenguajes de programación",
    
    // Cool software section
    coolSoftware: "COOL SOFTWARE",
    coolSoftwareIntro: "estas son algunas herramientas que uso y que creo que vale la pena revisar si se adaptan a alguna de tus necesidades.",
    commandLine: "→ línea de comandos",
    python: "→ python",
    LaTeX: "→ LaTeX",
    
    // Footer
    forkText: "Este sitio es un fork de",
    repo: "este"
  }
};
