/* =====================================================================
   DATA — subjects, categories, authors, and the generated resource set
===================================================================== */
const SUBJECTS = [
    { name: "Computer Science", icon: "💻" }, { name: "Mathematics", icon: "📐" }, { name: "Physics", icon: "⚛️" },
    { name: "Chemistry", icon: "🧪" }, { name: "Biology", icon: "🧬" }, { name: "English", icon: "📗" },
    { name: "History", icon: "🏛️" }, { name: "Geography", icon: "🌍" }, { name: "Economics", icon: "📈" },
    { name: "Business Studies", icon: "💼" }, { name: "Programming", icon: "👨‍💻" }, { name: "Environmental Studies", icon: "🌱" }
];

const CATEGORIES = [
    { name: "Books", icon: "📚", desc: "Full-length textbooks and reference books." },
    { name: "Notes", icon: "📝", desc: "Concise topic-wise study notes." },
    { name: "PDFs", icon: "📄", desc: "Downloadable PDF documents." },
    { name: "Question Papers", icon: "🧾", desc: "Previous year exam papers." },
    { name: "Study Guides", icon: "🗂️", desc: "Structured guides for exam prep." },
    { name: "Reference Materials", icon: "📖", desc: "Encyclopedias and reference works." },
    { name: "Programming Resources", icon: "⌨️", desc: "Code-alongs, cheat sheets & tutorials." },
    { name: "Research Papers", icon: "🔬", desc: "Academic and scientific papers." }
];

const AUTHORS = [
    { name: "Dr. Elena Marsh", field: "Computer Science" }, { name: "Rajiv Kapoor", field: "Mathematics" },
    { name: "Dr. Amara Chen", field: "Physics" }, { name: "Samuel O. Whitfield", field: "Chemistry" },
    { name: "Dr. Priya Nair", field: "Biology" }, { name: "Laura Bennett", field: "English" },
    { name: "Dr. Marcus Webb", field: "History" }, { name: "Fatima Zahra", field: "Geography" },
    { name: "Dr. Oliver Grant", field: "Economics" }, { name: "Nina Torres", field: "Business Studies" },
    { name: "Kevin Park", field: "Programming" }, { name: "Dr. Sofia Reyes", field: "Environmental Studies" }
];

const ADJ = ["Complete", "Modern", "Essential", "Advanced", "Practical", "Concise", "Illustrated", "Comprehensive", "Applied", "Fundamentals of"];
const NOUN = ["Guide", "Handbook", "Notes", "Workbook", "Reference", "Companion", "Primer", "Manual", "Overview", "Study Pack"];

function buildResources() {
    const list = []; let id = 1;
    const types = ["Book", "Notes", "PDF", "Question Paper", "Study Guide"];
    SUBJECTS.forEach((subj, si) => {
        const count = 3 + (si % 2 === 0 ? 1 : 0);
        for (let i = 0; i < count; i++) {
            const author = AUTHORS.find(a => a.field === subj.name) || AUTHORS[si % AUTHORS.length];
            const category = CATEGORIES[(si + i) % CATEGORIES.length].name;
            const type = types[i % types.length];
            list.push({
                id: id++,
                title: `${ADJ[(si + i) % ADJ.length]} ${subj.name} ${NOUN[(si + i * 2) % NOUN.length]}`,
                author: author.name,
                subject: subj.name,
                category: category,
                type: type,
                description: `A carefully structured ${type.toLowerCase()} covering key concepts in ${subj.name}, designed to help learners build a strong foundation and prepare effectively for coursework and exams.`,
                icon: subj.icon,
                rating: (3.6 + ((si + i) % 14) / 10).toFixed(1),
                views: 300 + (si * 137 + i * 57) % 9000,
                downloads: 50 + (si * 61 + i * 23) % 4000,
                pages: 80 + (si * 13 + i * 9) % 400,
                language: "English",
                year: 2018 + ((si + i) % 8),
                featured: (i === 0),
                popular: (i % 3 === 0),
                dateAdded: Date.now() - ((si * 3 + i) * 86400000)
            });
        }
    });
    return list;
}

const RESOURCES = buildResources();