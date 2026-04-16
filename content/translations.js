// Language translations for the site
// Note: English content is now sourced directly from index.html
// This file only contains Spanish translations
window.translations = {
    es: {
        // Header
        title: "Juan Vásquez",
        cv: "cv académico",
        resume: "résumé",
        updated: "Actualizado",

        // Navigation
        contents: "Contenidos",
        intro: "intro",
        contact: "contacto",
        acpublications: "publicaciones académicas",
        my_publications: "/mis_publicaciones/",
        teaching: "enseñanza",
        professionalWork: "trabajo profesional",
        otherWork: "otro trabajo",
        extra: "?",

        // Intro section
        introText: `soy Juan Vásquez, estudiante de doctorado en Ciencias de la Computación en la Universidad de Colorado Boulder.`,
        introText2: `mi área de especialización es Procesamiento del Lenguaje Natural (PLN) y actualmente trabajo en análisis conversacional siguiendo el trabajo de <a href="https://tisjune.github.io/">Dra. Justine Zhang.</a>`,
        introText3: `durante mi maestría (especialización en Inteligencia Artificial), trabajé en detección de lenguaje heteronormativo y detección de discurso de odio en español mexicano bajo la supervisión de <a href="https://scholar.google.com/citations?user=RXWYz10AAAAJ&hl=es">Dra. Gemma Bel Enguix</a> y <a href="https://www.fciencias.unam.mx/directorio/34006">Dra. Karla Ramírez Pulido</a>.`,
        introText4: "en mi tiempo libre me gusta jugar J-RPGs, ver películas y leer literatura latinoamericana contemporánea.",

        // Contact section
        contactText: "puedes contactarme por correo electrónico en juanmvs[at]pm.me",
        contactSocials: "también puedes encontrar mis redes sociales aquí:",

        // Teaching section
        teachingHeaders: {
            course: "Curso",
            place: "Lugar",
            period: "Periodo",
            description: "Descripción"
        },
        teachingRoles: {
            spring: "primavera",
            fall: "invierno",
            spring_and_fall: "primavera & invierno",
            ta: "asistente de cátedra",
            instructor: "instructor principal"
        },
        courseMaterials: "materiales creados para el curso disponibles",
        here: "aquí",
        spanish: "(en español)",
        courseIntroProgrammingPython: "Introducción a la programación con Python",
        courseIntroNLPI: "Introducción a Procesamiento de Lenguaje Natural con Python I",
        courseIntroNLPII: "Introducción a Procesamiento de Lenguaje Natural con Python II",

        january: "enero",
        jan_july: "enero - julio",
        march_july: "marzo - julio",
        may: "mayo",
        july: "julio",
        sept_june: "sept - junio",

        // Professional work section
        graduateResearcher: "investigador de posgrado",
        conversationalAgentConsultant: "consultor de agentes conversacionales",

        // Graduate Researcher bullets
        grBullet1: "diseñé un *pipeline* de análisis de podcasts acelerado por GPU que combina transcripción (`WhisperX`), diarización (`pyannote.audio`) y 8 modelos de lenguaje especializados en detección multi-etiqueta de discurso de odio, logrando acelearar mediante optimización torch.compile y cuantización BFloat16 en GPUs NVIDIA H100/A100.",
        grBullet2: "construí un sistema de identificación de hablantes de 5 etapas usando spaCy NER, análisis cross-episodio y clasificación de roles basada en LLM para reemplazar automáticamente IDs de hablantes con nombres reales en más de 21 programas de podcast.",
        grBullet3: "implementé detección de patrones de deshumanización basada en embeddings semánticos usando sentence transformers, logrando 50-100x aceleración en GPU.",
        grBullet4: "desarrollé una arquitectura neurosimbólica que combina Abstract Meaning Representations (AMR) con Graph Neural Networks para análisis interpretable de clasificación de texto.",
        grBullet5: "procesé 11,000 documentos a través de pipelines de parsing AMR para construir conjuntos de datos de grafos semánticos para entrenamiento de GNN.",
        grBullet6: "evalué arquitecturas GAT, GCN y GraphSAGE en grafos derivados de AMR, estableciendo líneas base para comprensión neurosimbólica de documentos.",

        // Conversational Agent Consultant bullets
        cacBullet1: "construí un agente conversacional impulsado por <code>Llama3.3</code> que proporciona soporte confidencial 24/7 a sobrevivientes de violencia laboral, dando asesoría a usuarios con recursos legales y servicios de intervención en crisis.",
        cacBullet2: "diseñé e implementé un *pipeline* con un módulo RAG (*Retrieval Augmented Generation) logrando 100% de precisión en recuperación de fuentes y 93% de cobertura de palabras clave en consultas legales de dominio específico.",
        cacBullet3: "colaboré con expertos legales para diseñar e impelementar una base de conocimiento de protocolos de apoyo a víctimas informados por trauma, alineados con marcos de justicia restaurativa.",

        // Other work section
        organizerRole: "organizador",
        attendingStudent: "estudiante asistente",
        programCommittee: "miembro del comité de programa",
        presenter: "presentador",
        keynoteSpeaker: "ponente principal",
        guestSpeaker: "ponente invitado",
        firstPlace: "primer lugar",
        talk: "charla",

        // Extra section
        researchers: "INVESTIGADORXS",
        researchersIntro: "estxs son algunxs investigadorxs cuyo trabajo sigo de cerca y que encuentro muy interesante. checa su trabajo si quieres aprender más sobre varias áreas en Ciencias de la Computación :)",

        // Research areas
        compAnalConv: "→ análisis computacional de conversaciones",
        compSocSci: "→ ciencias sociales computacionales",
        dataProtection: "protección de datos y tecnología, gobernanza, privacidad y gobernanza",
        deepfakes: "→ deepfakes y detección de contenido generado por LLM",
        ethics: "→ ética en IA y PLN",
        formalLanguages: "→ lenguajes formales y redes neuronales",
        formalSemantics: "→ semántica formal / representaciones semánticas",
        grounded: "→ adquisición de lenguaje fundamentado",
        compLinguistics: "→ lingüística / lingüística computacional",
        llmDesign: "→ diseño, evaluación y análisis de LLM",
        llmFairness: "→ equidad de LLM y eliminación de sesgos",
        logic: "→ lógica / demostración de teoremas",
        neurosymbolic: "→ PLN neurosimbólico",
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
