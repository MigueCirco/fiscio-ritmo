export const exercises = [
    {
        id: 'kegel-basico',
        title: 'Kegel básico (PC)',
        howTo: 'Acostado boca arriba o sentado con la espalda apoyada, inhala y al exhalar contrae el músculo PC (como si detuvieras la orina) durante 5 segundos. Relaja completo antes de repetir.',
        why: 'Fortalece el suelo pélvico para mejorar el control y la calidad de la erección sin generar impacto en el fémur.',
        sets: 3,
        reps: 12,
        timerType: 'kegel',
        workTime: 5,
        restTime: 5,
        repRestTime: 5,
        setRestTime: 30
    },
    {
        id: 'kegel-rapido',
        title: 'Kegel rápido (PC)',
        howTo: 'En posición cómoda, realiza contracciones rápidas del músculo PC: contrae 1 segundo y suelta 1 segundo manteniendo respiración fluida.',
        why: 'Mejora la respuesta neuromuscular del suelo pélvico y la capacidad de sostener rigidez durante esfuerzos breves.',
        sets: 3,
        reps: 20,
        timerType: 'kegel',
        workTime: 1,
        restTime: 1,
        repRestTime: 1,
        setRestTime: 30
    },
    {
        id: 'kegel-escalera',
        title: 'Kegel en escalera (PC)',
        howTo: 'Contrae el músculo PC en 3 niveles: suave, medio y fuerte (2 segundos por nivel). Luego desciende suave en el mismo orden y relaja completo.',
        why: 'Aumenta control fino del músculo PC, útil para modular la tensión pélvica y prevenir fatiga temprana.',
        sets: 3,
        reps: 8,
        timerType: 'kegel',
        workTime: 6,
        restTime: 6,
        repRestTime: 6,
        setRestTime: 40
    },
    {
        id: 'mariposa-acostado',
        title: 'Mariposa acostado',
        howTo: 'Acostado boca arriba, flexiona las rodillas, une las plantas de los pies y deja caer las rodillas hacia los lados abriendo la cadera de forma controlada. Luego, vuelve a cerrarlas.',
        why: 'Recupera la movilidad de la articulación de la cadera, estira los aductores y fomenta la lubricación articular sin poner carga de peso.',
        sets: 3,
        reps: 10,
        timerType: 'regular',
        restTime: 45 // seconds
    },
    {
        id: 'puente-gluteos',
        title: 'Puente de glúteos',
        howTo: 'Acostado boca arriba con rodillas flexionadas. Empuja el suelo con los talones, contrae los glúteos y eleva la cadera hasta alinear torso y muslos. Baja controlado.',
        why: 'Despierta y fortalece la cadena posterior (glúteos e isquiotibiales), estabiliza la pelvis y da soporte a la zona lumbar.',
        sets: 3,
        reps: 10,
        timerType: 'regular',
        restTime: 45 // seconds
    },
    {
        id: 'flexion-isometrica-pelota',
        title: 'Flexión isométrica con pelota',
        howTo: 'Sentado, con una pelota gigante detrás de las piernas. Lleva los talones hacia atrás presionando la pelota y mantén la tensión isométrica durante 10 segundos por repetición.',
        why: 'Fortalece los isquiotibiales sin movimiento articular, ganando fuerza y resistencia mientras se protegen los tendones y la rodilla.',
        sets: 3,
        reps: 10,
        timerType: 'interval',
        workTime: 10, // seconds
        restTime: 5 // seconds
    },
    {
        id: 'extension-rodillas',
        title: 'Extensión de rodillas',
        howTo: 'Sentado con la espalda recta, extiende ambas rodillas al mismo tiempo hasta que las piernas queden rectas. Baja lentamente.',
        why: 'Desarrolla fuerza directa en los cuádriceps, músculos indispensables para la estabilidad, para absorber impactos y para el soporte del peso corporal.',
        sets: 3,
        reps: 10,
        timerType: 'regular',
        restTime: 45 // seconds
    },
    {
        id: 'circuito-muletas',
        title: 'Circuito de pie con muletas',
        howTo: 'Con apoyo seguro en las muletas y espalda recta, realizar tres variantes: A) Subir rodilla flexionada al pecho. B) Levantar pierna extendida hacia adelante. C) Levantar pierna extendida de forma lateral (abducción).',
        why: 'Reeduca la mecánica de la marcha. Trabaja flexores de cadera (psoas) y estabilizadores laterales (glúteo medio), fundamentales para evitar asimetrías o cojeras al caminar.',
        sets: 3,
        reps: 10, // "10 por cada variante", lo tratamos como un todo por serie para simplificar el tracker, o podemos notar que cada serie toma más tiempo.
        timerType: 'regular',
        restTime: 60 // seconds to rest after the whole circuit
    }
];
