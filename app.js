
/* =====================================================
   DOCUSTUDIO v2.1
   COMPLETE DOCUMENT DESIGN STUDIO JAVASCRIPT
===================================================== */


/* =====================================================
   1. TEMPLATE CONFIGURATION
===================================================== */

const templates = {

    "id-card": {
        form: "idCardForm",
        preview: "idCardPreview",
        name: "Identity Card",

        fields: {
            idFullName: "previewIdName",
            idDob: "previewIdDob",
            idGender: "previewIdGender",
            idNationality: "previewIdNationality",
            idBirthplace: "previewIdBirthplace",
            idReference: "previewIdReference",
            idExpiry: "previewIdExpiry"
        },

        photoInput: "idPhoto",
        photoContainer: ".identity-photo",
        photoPreview: "previewIdPhoto"
    },


    "driver-card": {
        form: "driverForm",
        preview: "driverPreview",
        name: "Driver Profile",

        fields: {
            driverName: "previewDriverName",
            driverDob: "previewDriverDob",
            driverCategory: "previewDriverCategory",
            driverVehicle: "previewDriverVehicle",
            driverCountry: "previewDriverCountry",
            driverReference: "previewDriverReference"
        },

        photoInput: "driverPhoto",
        photoContainer: ".driver-photo",
        photoPreview: "previewDriverPhoto"
    },


    "passport": {
        form: "passportForm",
        preview: "passportPreview",
        name: "Passport",

        fields: {
            passportName: "previewPassportName",
            passportNationality: "previewPassportNationality",
            passportDob: "previewPassportDob",
            passportGender: "previewPassportGender",
            passportBirthplace: "previewPassportBirthplace",
            passportReference: "previewPassportReference",
            passportIssue: "previewPassportIssue",
            passportExpiry: "previewPassportExpiry"
        },

        photoInput: "passportPhoto",
        photoContainer: ".passport-photo",
        photoPreview: "previewPassportPhoto"
    },


    "flight-ticket": {
        form: "flightForm",
        preview: "flightPreview",
        name: "Flight Ticket",

        fields: {
            passengerName: "previewPassenger",
            airlineName: "previewAirline",
            departureCity: "previewDeparture",
            destinationCity: "previewDestination",
            flightNumber: "previewFlightNumber",
            departureDate: "previewFlightDate",
            departureTime: "previewDepartureTime",
            arrivalTime: "previewArrivalTime",
            seatNumber: "previewSeat",
            flightGate: "previewGate",
            flightClass: "previewClass"
        }
    }

};


/* =====================================================
   2. GLOBAL VARIABLES
===================================================== */

let currentTemplate = "id-card";

let uploadedPhotos = {};

let savedDesigns = [];

let currentTheme = "ocean";

const STORAGE_KEY = "docustudio_saved_designs";

const DEFAULT_VALUES = {};


/* =====================================================
   3. ELEMENT HELPERS
===================================================== */

function getElement(id) {
    return document.getElementById(id);
}

function getTemplateConfig() {
    return templates[currentTemplate];
}

function getActivePreview() {
    const config = getTemplateConfig();

    return config ? getElement(config.preview) : null;
}

function getActiveForm() {
    const config = getTemplateConfig();

    return config ? getElement(config.form) : null;
}


/* =====================================================
   4. DATE FORMATTER
===================================================== */

function formatDate(value) {

    if (!value) return "";

    const date = new Date(value + "T00:00:00");

    if (isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


/* =====================================================
   5. TEMPLATE SWITCHING
===================================================== */

function switchTemplate(templateName) {

    if (templateName === "my-documents") {

        const library = getElement("my-documents");

        if (library) {
            library.scrollIntoView({
                behavior: "smooth"
            });
        }

        return;
    }

    if (!templates[templateName]) {
        console.error("Unknown template:", templateName);
        return;
    }

    currentTemplate = templateName;

    document.querySelectorAll(".template-form").forEach(form => {
        form.classList.remove("active");
    });

    document.querySelectorAll(".document-preview").forEach(preview => {
        preview.classList.remove("active");
    });

    document.querySelectorAll(".template-card").forEach(card => {
        card.classList.remove("active");
    });

    document.querySelectorAll(".nav-item[data-template]").forEach(item => {
        item.classList.remove("active");
    });

    const config = templates[templateName];

    const form = getElement(config.form);
    const preview = getElement(config.preview);

    if (form) form.classList.add("active");

    if (preview) preview.classList.add("active");

    document.querySelectorAll(
        '[data-template="' + templateName + '"]'
    ).forEach(item => {
        item.classList.add("active");
    });

    updatePreview();

    applyDesignSettings();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =====================================================
   6. LIVE PREVIEW
===================================================== */

function updatePreview() {

    const config = getTemplateConfig();

    if (!config) return;

    Object.entries(config.fields).forEach(([inputId, previewId]) => {

        const input = getElement(inputId);
        const preview = getElement(previewId);

        if (!input || !preview) return;

        let value = input.value.trim();

        if (input.type === "date" && value) {
            value = formatDate(value);
        }

        if (value) {
            preview.textContent = value;
        } else {
            preview.textContent =
                DEFAULT_VALUES[previewId] || "---";
        }

    });

    updateSampleWatermarks();
}


/* =====================================================
   7. SAVE ORIGINAL PREVIEW TEXT
===================================================== */

function collectDefaultValues() {

    document.querySelectorAll(".document-preview [id]").forEach(element => {

        DEFAULT_VALUES[element.id] = element.textContent.trim();

    });

}


/* =====================================================
   8. PHOTOGRAPH UPLOADS
===================================================== */

function handlePhotoUpload(input, templateName) {

    if (!input.files || !input.files[0]) return;

    const file = input.files[0];

    if (!file.type.startsWith("image/")) {
        alert("Please select a valid image.");
        input.value = "";
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert("Please select an image smaller than 5MB.");
        input.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = function(event) {

        uploadedPhotos[templateName] = event.target.result;

        const config = templates[templateName];

        const photo = getElement(config.photoPreview);

        if (photo) {
            photo.src = event.target.result;
            photo.style.display = "block";
        }

    };

    reader.readAsDataURL(file);
}


/* =====================================================
   9. SAMPLE WATERMARKS
===================================================== */

function updateSampleWatermarks() {

    document.querySelectorAll(".document-preview").forEach(preview => {

        preview.setAttribute("data-fictional", "true");

    });

    const ticket = document.querySelector(".boarding-ticket");

    if (ticket) {
        ticket.id = "boardingTicket";
        ticket.setAttribute("data-theme", currentTheme);
    }

}


/* =====================================================
   10. FLIGHT TICKET COLOUR THEMES
===================================================== */

function createFlightThemeControl() {

    const propertiesPanel = document.querySelector(".properties-panel");

    if (!propertiesPanel) return;

    if (getElement("flightTheme")) return;

    const divider = document.createElement("div");

    divider.className = "property-divider";

    const group = document.createElement("div");

    group.className = "property-group";

    const label = document.createElement("label");

    label.textContent = "Flight Ticket Colour Theme";
    label.htmlFor = "flightTheme";

    const select = document.createElement("select");

    select.id = "flightTheme";

    const themes = [
        { value: "ocean", label: "Ocean Blue" },
        { value: "violet", label: "Royal Violet" },
        { value: "emerald", label: "Emerald Green" },
        { value: "sunset", label: "Sunset Orange" },
        { value: "crimson", label: "Crimson Red" }
    ];

    themes.forEach(theme => {

        const option = document.createElement("option");

        option.value = theme.value;
        option.textContent = theme.label;

        select.appendChild(option);

    });

    select.value = currentTheme;

    select.addEventListener("change", function() {

        currentTheme = this.value;

        updateTicketTheme();

    });

    group.appendChild(label);
    group.appendChild(select);

    propertiesPanel.appendChild(divider);
    propertiesPanel.appendChild(group);

}


function updateTicketTheme() {

    const ticket = getElement("boardingTicket");

    if (!ticket) return;

    ticket.setAttribute("data-theme", currentTheme);

}


/* =====================================================
   11. DESIGN PROPERTIES
===================================================== */

function applyDesignSettings() {

    const preview = getActivePreview();

    if (!preview) return;

    const background = getElement("backgroundColor");
    const text = getElement("textColor");
    const font = getElement("fontFamily");
    const size = getElement("designSize");

    const documentDesign = preview.querySelector(
        ".identity-card, .driver-card, .passport-design, .boarding-ticket"
    );

    if (!documentDesign) return;

    if (background && background.value) {

        documentDesign.style.setProperty(
            "--custom-background",
            background.value
        );

    }

    if (text && text.value) {

        documentDesign.style.setProperty(
            "--custom-text",
            text.value
        );

    }

    if (font && font.value) {

        documentDesign.style.fontFamily = font.value;

    }

    if (size) {

        if (size.value === "large") {

            documentDesign.style.transform = "scale(1.04)";

        } else {

            documentDesign.style.transform = "scale(1)";

        }

    }

}


/* =====================================================
   12. APPLY CUSTOM COLOURS
===================================================== */

function applyCustomColours() {

    const preview = getActivePreview();

    if (!preview) return;

    const design = preview.querySelector(
        ".identity-card, .driver-card, .passport-design, .boarding-ticket"
    );

    if (!design) return;

    const background = getElement("backgroundColor");
    const text = getElement("textColor");

    if (background) {

        design.style.backgroundColor = background.value;

    }

    if (text) {

        design.style.color = text.value;

    }

    applyDesignSettings();

}


/* =====================================================
   13. COLLECT FORM DATA
===================================================== */

function collectFormData(templateName) {

    const config = templates[templateName];

    if (!config) return {};

    const form = getElement(config.form);

    if (!form) return {};

    const data = {};

    form.querySelectorAll("input, select, textarea").forEach(input => {

        if (input.type === "file") return;

        data[input.id] = input.value;

    });

    return data;

}


/* =====================================================
   14. SAVE CURRENT DESIGN
===================================================== */

function saveDesign() {

    const config = getTemplateConfig();

    if (!config) return;

    const design = {

        id: Date.now(),

        template: currentTemplate,

        name: config.name,

        date: new Date().toLocaleString(),

        data: collectFormData(currentTemplate),

        photo: uploadedPhotos[currentTemplate] || null,

        settings: {

            background: getElement("backgroundColor")?.value || "#DCE8F4",

            text: getElement("textColor")?.value || "#26364D",

            font: getElement("fontFamily")?.value || "Arial",

            size: getElement("designSize")?.value || "standard",

            theme: currentTheme

        }

    };

    savedDesigns.push(design);

    persistDesigns();

    renderSavedDocuments();

    alert("Your design has been saved successfully.");

}


/* =====================================================
   15. LOCAL STORAGE
===================================================== */

function persistDesigns() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(savedDesigns)
        );

    } catch (error) {

        alert("Unable to save. Your browser storage may be full.");

        console.error(error);

    }

}


function loadSavedDesigns() {

    try {

        const stored = localStorage.getItem(STORAGE_KEY);

        savedDesigns = stored ? JSON.parse(stored) : [];

        if (!Array.isArray(savedDesigns)) {
            savedDesigns = [];
        }

    } catch (error) {

        savedDesigns = [];

        console.error("Could not load saved designs:", error);

    }

}


/* =====================================================
   16. RENDER SAVED DOCUMENTS
===================================================== */

function renderSavedDocuments() {

    const container = getElement("savedDocumentsGrid");

    if (!container) return;

    container.innerHTML = "";

    if (savedDesigns.length === 0) {

        container.innerHTML = `
            <div class="empty-library">
                <h3>No Saved Designs</h3>
                <p>Your saved documents will appear here.</p>
            </div>
        `;

        return;
    }

    savedDesigns.forEach(design => {

        const card = document.createElement("div");

        card.className = "saved-document-card";

        const title = document.createElement("h4");
        title.textContent = design.name;

        const date = document.createElement("small");
        date.textContent = design.date;

        const loadButton = document.createElement("button");
        loadButton.textContent = "Open Design";

        loadButton.addEventListener("click", () => {
            loadDocument(design.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            deleteDocument(design.id);
        });

        card.appendChild(title);
        card.appendChild(date);
        card.appendChild(loadButton);
        card.appendChild(deleteButton);

        container.appendChild(card);

    });

}


/* =====================================================
   17. LOAD SAVED DOCUMENT
===================================================== */

function loadDocument(id) {

    const design = savedDesigns.find(item => item.id === id);

    if (!design) return;

    if (!templates[design.template]) {

      
        return;

    }

    switchTemplate(design.template);

    const config = templates[design.template];

    const form = getElement(config.form);

    if (!form) return;

    form.querySelectorAll("input, select, textarea").forEach(input => {

        if (input.type === "file") return;

        if (Object.prototype.hasOwnProperty.call(design.data, input.id)) {

            input.value = design.data[input.id];

        }

    });

    if (design.photo) {

        uploadedPhotos[design.template] = design.photo;

        if (config.photoPreview) {

            const photo = getElement(config.photoPreview);

            if (photo) photo.src = design.photo;

        }

    }

    if (design.settings) {

        if (getElement("backgroundColor")) {
            getElement("backgroundColor").value =
                design.settings.background || "#DCE8F4";
        }

        if (getElement("textColor")) {
            getElement("textColor").value =
                design.settings.text || "#26364D";
        }

        if (getElement("fontFamily")) {
            getElement("fontFamily").value =
                design.settings.font || "Arial";
        }

        if (getElement("designSize")) {
            getElement("designSize").value =
                design.settings.size || "standard";
        }

        currentTheme = design.settings.theme || "ocean";

        if (getElement("flightTheme")) {
            getElement("flightTheme").value = currentTheme;
        }

    }

    updatePreview();

    applyDesignSettings();

    updateTicketTheme();

    alert("Design opened successfully.");

}


/* =====================================================
   18. DELETE SAVED DOCUMENT
===================================================== */

function deleteDocument(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this saved design?"
    );

    if (!confirmDelete) return;

    savedDesigns = savedDesigns.filter(item => item.id !== id);

    persistDesigns();

    renderSavedDocuments();

}


/* =====================================================
   19. RESET CURRENT FORM
===================================================== */

function resetCurrentDesign() {

    const config = getTemplateConfig();

    if (!config) return;

    const form = getElement(config.form);

    if (!form) return;

    form.reset();

    delete uploadedPhotos[currentTemplate];

    if (config.photoPreview) {

        const photo = getElement(config.photoPreview);

        if (photo) photo.removeAttribute("src");

    }

    const preview = getActivePreview();

    if (preview) {

        preview.querySelectorAll("img").forEach(img => {
            img.removeAttribute("src");
        });

    }

    updatePreview();

}


/* =====================================================
   20. RESET ALL DESIGN SETTINGS
===================================================== */

function resetDesignSettings() {

    if (getElement("backgroundColor")) {
        getElement("backgroundColor").value = "#DCE8F4";
    }

    if (getElement("textColor")) {
        getElement("textColor").value = "#26364D";
    }

    if (getElement("fontFamily")) {
        getElement("fontFamily").value = "Arial";
    }

    if (getElement("designSize")) {
        getElement("designSize").value = "standard";
    }

    currentTheme = "ocean";

    if (getElement("flightTheme")) {
        getElement("flightTheme").value = currentTheme;
    }

    const config = getTemplateConfig();

    const preview = getActivePreview();

    if (preview) {

        const design = preview.querySelector(
            ".identity-card, .driver-card, .passport-design, .boarding-ticket"
        );

        if (design) {

            design.removeAttribute("style");

        }

    }

    updateTicketTheme();

}


/* =====================================================
   21. RESET BUTTON
===================================================== */

function resetAll() {

    const confirmReset = confirm(
        "Reset the current document and its design settings?"
    );

    if (!confirmReset) return;

    resetCurrentDesign();

    resetDesignSettings();

}


/* =====================================================
   22. DOWNLOAD / PRINT DESIGN
===================================================== */

function downloadDesign() {

    const preview = getActivePreview();

    if (!preview) return;

    const design = preview.querySelector(
        ".identity-card, .driver-card, .passport-design, .boarding-ticket"
    );

    if (!design) return;

    const printWindow = window.open("", "_blank");

    if (!printWindow) {

        alert("Please allow pop-ups to print or save your design.");

        return;

    }

    const styles = Array.from(
        document.querySelectorAll("style, link[rel='stylesheet']")
    ).map(element => element.outerHTML).join("\n");

    const clonedDesign = design.cloneNode(true);

    const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            
            ${styles}

            <style>
                body {
                    background: white !important;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 30px;
                    font-family: Arial, sans-serif;
                }

                * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }

                .identity-card,
                .driver-card,
                .passport-design,
                .boarding-ticket {
                    transform: none !important;
                    max-width: 100% !important;
                }

                @media print {
                    body {
                        padding: 10px;
                    }
                }
            </style>

        </head>

        <body>
            ${clonedDesign.outerHTML}
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                    }, 500);
                };
            <\/script>
        </body>
        </html>
    `;

    printWindow.document.open();

    printWindow.document.write(html);

    printWindow.document.close();

}


/* =====================================================
   23. SIDEBAR TOGGLE
===================================================== */

function setupSidebar() {

    const toggle = getElement("sidebarToggle");

    const sidebar = getElement("sidebar");

    if (!toggle || !sidebar) return;

    toggle.addEventListener("click", () => {

        sidebar.classList.toggle("active");

    });

    document.addEventListener("click", event => {

        if (window.innerWidth > 850) return;

        if (
            sidebar.classList.contains("active") &&
            !sidebar.contains(event.target) &&
            !toggle.contains(event.target)
        ) {

            sidebar.classList.remove("active");

        }

    });

}


/* =====================================================
   24. TEMPLATE BUTTON EVENTS
===================================================== */

function setupTemplateButtons() {

    document.querySelectorAll("[data-template]").forEach(button => {

        button.addEventListener("click", function() {

            const templateName = this.getAttribute("data-template");

            switchTemplate(templateName);

            const sidebar = getElement("sidebar");

            if (sidebar && window.innerWidth <= 850) {
                sidebar.classList.remove("active");
            }

        });

    });

}


/* =====================================================
   25. LIVE FORM EVENTS
===================================================== */

function setupLivePreview() {

    document.querySelectorAll(".template-form").forEach(form => {

        form.addEventListener("input", updatePreview);

        form.addEventListener("change", updatePreview);

    });

}


/* =====================================================
   26. PHOTO INPUT EVENTS
===================================================== */

function setupPhotoUploads() {

    Object.entries(templates).forEach(([templateName, config]) => {

        if (!config.photoInput) return;

        const input = getElement(config.photoInput);

        if (!input) return;

        input.addEventListener("change", function() {

            handlePhotoUpload(this, templateName);

        });

    });

}


/* =====================================================
   27. PROPERTY CONTROL EVENTS
===================================================== */

function setupPropertyControls() {

    [
        "backgroundColor",
        "textColor",
        "fontFamily",
        "designSize"
    ].forEach(id => {

        const element = getElement(id);

        if (!element) return;

        element.addEventListener("input", applyCustomColours);

        element.addEventListener("change", applyCustomColours);

    });

}


/* =====================================================
   28. MAIN BUTTON EVENTS
===================================================== */

function setupMainButtons() {

    const saveButton = getElement("saveDesign");

    const resetButton = getElement("resetDesign");

    const previewReset = getElement("previewReset");

    const downloadButton = getElement("downloadDesign");

    if (saveButton) {
        saveButton.addEventListener("click", saveDesign);
    }

    if (resetButton) {
        resetButton.addEventListener("click", resetAll);
    }

    if (previewReset) {
        previewReset.addEventListener("click", resetCurrentDesign);
    }

    if (downloadButton) {
        downloadButton.addEventListener("click", downloadDesign);
    }

}


/* =====================================================
   29. INITIALIZE APPLICATION
===================================================== */

function initializeDocuStudio() {

    collectDefaultValues();

    loadSavedDesigns();

    setupSidebar();

    setupTemplateButtons();

    setupLivePreview();

    setupPhotoUploads();

    setupPropertyControls();

    setupMainButtons();

    createFlightThemeControl();

    renderSavedDocuments();

    switchTemplate("id-card");

    updatePreview();

    updateSampleWatermarks();

    updateTicketTheme();

}


/* =====================================================
   30. START APPLICATION
===================================================== */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeDocuStudio
    );

} else {

    initializeDocuStudio();

}


/* =====================================================
   END OF DOCUSTUDIO JAVASCRIPT
===================================================== */
