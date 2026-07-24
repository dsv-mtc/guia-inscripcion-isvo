// Always start at the top after loading or refreshing the page.
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

window.addEventListener('pageshow', () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
});

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // CARRUSEL PRINCIPAL
    // ==========================================
    const heroCarousel = document.querySelector('.hero-carousel');

    if (heroCarousel) {
        const slides = heroCarousel.querySelectorAll('.hero-slide');
        const dots = heroCarousel.querySelectorAll('.carousel-dot');
        const prevButton = heroCarousel.querySelector('.carousel-prev');
        const nextButton = heroCarousel.querySelector('.carousel-next');
        let currentSlide = 0;
        let carouselTimer;

        function showCarouselSlide(index) {
            currentSlide = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('active', slideIndex === currentSlide);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('active', dotIndex === currentSlide);
            });
        }

        function startCarousel() {
            clearTimeout(carouselTimer);
            const slideDuration = currentSlide === 1 ? 3000 : 7000;
            carouselTimer = setTimeout(() => {
                showCarouselSlide(currentSlide + 1);
                startCarousel();
            }, slideDuration);
        }

        prevButton.addEventListener('click', () => {
            showCarouselSlide(currentSlide - 1);
            startCarousel();
        });

        nextButton.addEventListener('click', () => {
            showCarouselSlide(currentSlide + 1);
            startCarousel();
        });

        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                showCarouselSlide(Number(dot.dataset.slide));
                startCarousel();
            });
        });

        startCarousel();
    }

    // ==========================================
    // 2. NAVEGACIÓN POR PESTAÑAS (TAB SYSTEM)
    // ==========================================
    const navTabs = document.querySelectorAll('.nav-tab');
    const mobileTabs = document.querySelectorAll('.mobile-tab');
    const tabPanes = document.querySelectorAll('.tab-pane');

    function switchTab(tabId) {
        // Update tabs active state (both desktop and mobile)
        navTabs.forEach(tab => {
            if (tab.getAttribute('data-tab') === tabId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        mobileTabs.forEach(tab => {
            if (tab.getAttribute('data-tab') === tabId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Show/hide tab panels
        tabPanes.forEach(pane => {
            if (pane.id === `tab-${tabId}`) {
                pane.classList.add('active');
            } else {
                pane.classList.remove('active');
            }
        });

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Trigger stats animation if switching to Home
        if (tabId === 'inicio') {
            runStatsAnimation();
        }
    }

    // Attach listeners
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.getAttribute('data-tab')));
    });

    mobileTabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.getAttribute('data-tab')));
    });

    // Inter-page navigation actions
    document.querySelectorAll('[data-action]').forEach(element => {
        element.addEventListener('click', (e) => {
            const action = e.currentTarget.getAttribute('data-action');
            if (action === 'go-to-guia') switchTab('guia');
            if (action === 'go-to-simulador') switchTab('simulador');
            if (action === 'go-to-format-simulator') switchTab('checklist');
            if (action === 'go-to-ayuda') switchTab('ayuda');
        });
    });

    // ==========================================
    // 3. ASISTENTE PASO A PASO (WIZARD)
    // ==========================================
    let currentStep = 1;
    const totalSteps = 4;
    const wizardPrevBtn = document.getElementById('wizard-prev');
    const wizardNextBtn = document.getElementById('wizard-next');
    const wizardProgressFill = document.getElementById('wizard-progress');
    const stepIndicators = document.querySelectorAll('.step-indicator-btn');
    const stepContents = document.querySelectorAll('.wizard-step-content');

    function updateWizard(step) {
        currentStep = step;
        
        // Update indicators
        stepIndicators.forEach(indicator => {
            const indStep = parseInt(indicator.getAttribute('data-step-target'));
            if (indStep === currentStep) {
                indicator.classList.add('active');
                indicator.classList.remove('completed');
            } else if (indStep < currentStep) {
                indicator.classList.remove('active');
                indicator.classList.add('completed');
            } else {
                indicator.classList.remove('active');
                indicator.classList.remove('completed');
            }
        });

        // Update progress bar
        const progressPercentage = currentStep > totalSteps
            ? 100
            : ((currentStep - 1) / (totalSteps - 1)) * 84; // 84% width is visual optimal
        wizardProgressFill.style.width = `${progressPercentage}%`;

        // Update step contents visibility
        stepContents.forEach(content => {
            if (parseInt(content.getAttribute('data-step-content')) === currentStep) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });

        // Handle buttons status
        wizardPrevBtn.disabled = currentStep === 1;
        if (currentStep > totalSteps) {
            wizardNextBtn.innerHTML = 'Ir a Recursos <i class="fa-solid fa-folder-open"></i>';
        } else if (currentStep === totalSteps) {
            wizardNextBtn.innerHTML = '¡Entendido! <i class="fa-solid fa-circle-check"></i>';
        } else {
            wizardNextBtn.innerHTML = 'Siguiente <i class="fa-solid fa-arrow-right"></i>';
        }
    }

    wizardPrevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            updateWizard(currentStep - 1);
        }
    });

    wizardNextBtn.addEventListener('click', () => {
        if (currentStep < totalSteps) {
            updateWizard(currentStep + 1);
        } else if (currentStep === totalSteps) {
            updateWizard(totalSteps + 1);
            showToast('Guía Completada', 'Gracias por asumir el compromiso con la seguridad vial organizacional.');
        } else {
            switchTab('recursos');
        }
    });

    // Make indicator numbers clickable
    stepIndicators.forEach(indicator => {
        indicator.addEventListener('click', (e) => {
            const targetStep = parseInt(e.currentTarget.getAttribute('data-step-target'));
            updateWizard(targetStep);
        });
    });

    // ==========================================
    // 4. SIMULADOR DE FORMULARIO
    // ==========================================
    const btnAutofill = document.getElementById('btn-autofill');
    const btnClearSim = document.getElementById('btn-clear-sim');
    const btnSubmitSim = document.getElementById('btn-submit-sim');
    const signatureImageInput = document.getElementById('signature-image-input');
    const btnPrintPreview = document.getElementById('btn-print-preview');
    const previewContainer = document.getElementById('rendered-doc');
    const signatureBox = previewContainer.querySelector('.signature-box-rendered');
    const previewCurrentDate = document.getElementById('preview-current-date');

    const formattedCurrentDate = new Intl.DateTimeFormat('es-PE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(new Date());
    previewCurrentDate.textContent = formattedCurrentDate;

    // Mappings between form inputs and preview fields
    const inputsMap = {
        'sim-ruc': '.text-ruc',
        'sim-dni': '.text-dni',
        'sim-name': '.text-name',
        'sim-address': '.text-address',
        'sim-department': '.text-department',
        'sim-district': '.text-district',
        'sim-prov': '.text-prov',
        'sim-rep': '.text-rep',
        'sim-email': '.text-email',
        'sim-phone': '.text-phone'
    };

    // Live update preview
    Object.keys(inputsMap).forEach(inputId => {
        const input = document.getElementById(inputId);
        const previewTargets = previewContainer.querySelectorAll(inputsMap[inputId]);
        
        input.addEventListener('input', (e) => {
            let value = e.target.value;

            if (inputId === 'sim-ruc' || inputId === 'sim-dni' || inputId === 'sim-phone') {
                const maxDigits = inputId === 'sim-ruc' ? 11 : inputId === 'sim-dni' ? 8 : 9;
                value = value.replace(/\D/g, '').slice(0, maxDigits);
                e.target.value = value;
            }
            
            previewTargets.forEach(target => {
                target.textContent = value;
            });

        });
    });

    // Autofill demo data
    const demoData = {
        'sim-ruc': '20549281357',
        'sim-dni': '45879621',
        'sim-name': 'Constructora & Logística Andina S.A.C.',
        'sim-address': 'Jr. Carabaya 542, Piso 4',
        'sim-department': 'Lima',
        'sim-district': 'Lima',
        'sim-prov': 'Lima',
        'sim-rep': 'Ing. Carlos Mendoza Alva',
        'sim-email': 'contacto@logisticaandina.com',
        'sim-phone': '981245789'
    };

    btnAutofill.addEventListener('click', () => {
        Object.keys(demoData).forEach(id => {
            const input = document.getElementById(id);
            input.value = demoData[id];
            
            // Trigger input event to update preview
            const event = new Event('input', { bubbles: true });
            input.dispatchEvent(event);
        });
        showToast('Datos de Demo cargados', 'Se han rellenado los campos con datos de prueba.');
    });

    btnClearSim.addEventListener('click', () => {
        document.getElementById('isvo-sim-form').reset();
        Object.keys(inputsMap).forEach(inputId => {
            document.getElementById(inputId).dispatchEvent(new Event('input', { bubbles: true }));
        });
        signatureImageInput.value = '';
        signatureBox.innerHTML = '<span class="sig-placeholder">Firma del Representante</span>';
        btnSubmitSim.innerHTML = '<i class="fa-solid fa-signature"></i> Seleccionar Firma';
        showToast('Formulario limpiado', 'Se eliminaron los datos y la firma de la solicitud.');
    });

    // Select a local signature image and place it in the request preview.
    btnSubmitSim.addEventListener('click', () => {
        signatureImageInput.value = '';
        signatureImageInput.click();
    });

    signatureImageInput.addEventListener('change', () => {
        const file = signatureImageInput.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast('Archivo no válido', 'Seleccione una imagen PNG, JPG o WEBP.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.addEventListener('load', () => {
            const signatureImage = document.createElement('img');
            signatureImage.src = reader.result;
            signatureImage.alt = 'Firma del representante legal';
            signatureImage.className = 'signature-image';
            signatureBox.replaceChildren(signatureImage);
            btnSubmitSim.innerHTML = '<i class="fa-solid fa-rotate"></i> Cambiar Firma';
            showToast('Firma agregada', 'La imagen se incorporó a la vista previa de la solicitud.');
        });
        reader.readAsDataURL(file);
    });

    // Print preview action
    btnPrintPreview.addEventListener('click', () => {
        const ruc = document.getElementById('sim-ruc').value;
        const name = document.getElementById('sim-name').value;
        
        if (!ruc || !name) {
            showToast('Formulario Vacío', 'Completa los campos antes de imprimir el borrador.', 'error');
            return;
        }

        // Print document preview area
        const printablePreview = previewContainer.cloneNode(true);
        printablePreview.querySelector('.preview-header')?.remove();
        printablePreview.querySelector('.sig-placeholder')?.remove();
        const printContent = printablePreview.innerHTML;
        
        // Open printable window
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title></title>
                <style>
                    @page { size: A4; margin: 0; }
                    html, body { margin: 0; padding: 0; }
                    body { box-sizing: border-box; min-height: 297mm; font-family: 'Inter', sans-serif; padding: 20mm; color: #333; font-size: 13px; }
                    .preview-header { border-bottom: 2px solid #0f2042; padding-bottom: 15px; margin-bottom: 30px; text-align: center; }
                    .preview-doc-title { font-weight: bold; font-size: 1.2rem; color: #0f2042; }
                    .preview-doc-sub { font-size: 0.8rem; color: #666; }
                    p { font-size: 1em; line-height: 1.5; text-align: justify; margin-bottom: 11px; }
                    strong, .preview-text { font-weight: 800 !important; color: #111; }
                    .request-recipient { text-align: left; line-height: 1.5; }
                    .request-subject { text-align: right; }
                    .preview-date-line { margin-top: 20px; text-align: right; }
                    .preview-date-line .preview-text { font-weight: 400 !important; }
                    .preview-footer { display: flex; justify-content: center; margin-top: 50px; }
                    .preview-signature { text-align: center; width: 290px; }
                    .preview-signature p { margin: 2px 0; text-align: center; line-height: 1.3; }
                    .signature-box-rendered { box-sizing: border-box; border-bottom: 1px solid #333; height: 90px; margin-bottom: 8px; padding-bottom: 4px; display: flex; align-items: flex-end; justify-content: center; }
                    .sig-placeholder { color: #777; font-size: 0.75rem; font-style: italic; }
                    .signature-image { display: block; max-width: 280px; max-height: 82px; object-fit: contain; }
                </style>
            </head>
            <body>
                ${printContent}
                <script>
                    window.onload = function() { window.print(); window.close(); }
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    });

    // ==========================================
    // 5. SIMULADOR DEL FORMATO DE INSCRIPCIÓN
    // ==========================================
    const formatForm = document.getElementById('isvo-format-form');
    const legalNameInput = document.getElementById('fmt-legal-name');
    const legalDocInput = document.getElementById('fmt-legal-doc');
    const companyInput = document.getElementById('fmt-company');
    const reportNameInput = document.getElementById('fmt-report-name');
    const reportDocInput = document.getElementById('fmt-report-doc');
    const reportWarning = document.getElementById('report-person-warning');
    const formatSignatureInput = document.getElementById('format-signature-input');
    const formatSignatureBox = document.getElementById('format-signature-box');
    const formatSignatureButton = document.getElementById('format-signature-button');
    let selectedFormatSignatureFile = null;

    function updateFormatDeclaration() {
        document.getElementById('declaration-name').textContent = legalNameInput.value.trim() || '[Representante Legal]';
        document.getElementById('declaration-doc').textContent = legalDocInput.value.trim() || '[Documento]';
        document.getElementById('declaration-company').textContent = companyInput.value.trim() || '[Organización]';

        const sameName = legalNameInput.value.trim() && legalNameInput.value.trim().toLowerCase() === reportNameInput.value.trim().toLowerCase();
        const sameDocument = legalDocInput.value.trim() && legalDocInput.value.trim() === reportDocInput.value.trim();
        reportWarning.classList.toggle('hidden', !(sameName || sameDocument));
    }

    [legalNameInput, legalDocInput, companyInput, reportNameInput, reportDocInput].forEach(input => {
        input.addEventListener('input', updateFormatDeclaration);
    });

    ['fmt-ruc', 'fmt-legal-phone', 'fmt-report-phone'].forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener('input', () => {
            input.value = input.value.replace(/\D/g, '');
        });
    });

    function configureFormatDocumentInput(typeId, documentId) {
        const typeSelect = document.getElementById(typeId);
        const documentInput = document.getElementById(documentId);

        const applyDocumentRules = () => {
            if (typeSelect.value === 'DNI') {
                documentInput.value = documentInput.value.replace(/\D/g, '').slice(0, 8);
                documentInput.maxLength = 8;
                documentInput.inputMode = 'numeric';
                documentInput.pattern = '[0-9]{8}';
                documentInput.placeholder = '8 dígitos';
            } else {
                documentInput.value = documentInput.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
                documentInput.maxLength = 12;
                documentInput.inputMode = 'text';
                documentInput.pattern = '[a-zA-Z0-9]{1,12}';
                documentInput.placeholder = 'Documento CE';
            }
            updateFormatDeclaration();
        };

        documentInput.addEventListener('input', applyDocumentRules);
        typeSelect.addEventListener('change', applyDocumentRules);
        applyDocumentRules();
    }

    configureFormatDocumentInput('fmt-legal-type', 'fmt-legal-doc');
    configureFormatDocumentInput('fmt-report-type', 'fmt-report-doc');

    document.querySelectorAll('.activity-check').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const beneficiaries = checkbox.closest('tr').querySelector('.beneficiary-input');
            beneficiaries.disabled = !checkbox.checked;
            beneficiaries.required = checkbox.checked;
            if (!checkbox.checked) beneficiaries.value = '';
        });
    });

    formatSignatureButton.addEventListener('click', () => {
        formatSignatureInput.value = '';
        formatSignatureInput.click();
    });

    formatSignatureInput.addEventListener('change', () => {
        const file = formatSignatureInput.files[0];
        if (!file) return;
        selectedFormatSignatureFile = file;
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            const image = document.createElement('img');
            image.src = reader.result;
            image.alt = 'Firma del representante legal';
            formatSignatureBox.replaceChildren(image);
            formatSignatureButton.innerHTML = '<i class="fa-solid fa-rotate"></i> Cambiar Firma';
        });
        reader.readAsDataURL(file);
    });

    document.getElementById('format-demo').addEventListener('click', () => {
        const demo = {
            'fmt-company': 'Transportes Seguros S.A.C.', 'fmt-ruc': '20549281357',
            'fmt-legal-name': 'Carlos Mendoza Alva', 'fmt-legal-doc': '45879621',
            'fmt-legal-email': 'gerencia@transportesseguros.pe', 'fmt-legal-phone': '981245789',
            'fmt-report-name': 'Lucía Torres Ramos', 'fmt-report-doc': '47125896',
            'fmt-report-email': 'reportes@transportesseguros.pe', 'fmt-report-phone': '965214783',
            'fmt-sector': 'Transporte de mercancías', 'fmt-address': 'Av. Industrial 450',
            'fmt-district': 'Ate', 'fmt-province': 'Lima', 'fmt-department': 'Lima',
            'fmt-location': '-12.048926, -77.055923'
        };
        Object.entries(demo).forEach(([id, value]) => {
            const input = document.getElementById(id);
            input.value = value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        showToast('Datos de demostración', 'El formato se completó con información de ejemplo.');
    });

    document.getElementById('format-clear').addEventListener('click', () => {
        formatForm.reset();
        document.querySelectorAll('.beneficiary-input').forEach(input => {
            input.disabled = true;
            input.required = false;
        });
        formatSignatureBox.innerHTML = '<span>Firma del Representante Legal</span>';
        formatSignatureButton.innerHTML = '<i class="fa-solid fa-signature"></i> Agregar imagen de firma';
        selectedFormatSignatureFile = null;
        updateFormatDeclaration();
    });

    document.getElementById('format-download-word').addEventListener('click', async () => {
        if (!formatForm.reportValidity()) return;
        if (!reportWarning.classList.contains('hidden')) {
            showToast('Revise los responsables', 'El Responsable del Reporte debe ser distinto al Representante Legal.', 'error');
            return;
        }

        if (typeof JSZip === 'undefined') {
            showToast('Generador no disponible', 'No se pudo cargar el componente para generar el archivo Word.', 'error');
            return;
        }

        const downloadButton = document.getElementById('format-download-word');
        downloadButton.disabled = true;
        downloadButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generando Word...';

        try {
            const selectLocalTemplate = () => new Promise((resolve, reject) => {
                const templateInput = document.getElementById('format-word-template');
                let settled = false;

                const cleanup = () => {
                    templateInput.onchange = null;
                    templateInput.oncancel = null;
                    window.removeEventListener('focus', handleWindowFocus);
                };

                const cancelSelection = () => {
                    if (settled) return;
                    settled = true;
                    cleanup();
                    const cancellation = new Error('Selección cancelada.');
                    cancellation.name = 'AbortError';
                    reject(cancellation);
                };

                const handleWindowFocus = () => {
                    setTimeout(() => {
                        if (!settled && !templateInput.files.length) cancelSelection();
                    }, 500);
                };

                templateInput.value = '';
                templateInput.onchange = async () => {
                    const selectedFile = templateInput.files[0];
                    if (!selectedFile) {
                        cancelSelection();
                        return;
                    }
                    settled = true;
                    cleanup();
                    try {
                        resolve(await selectedFile.arrayBuffer());
                    } catch (error) {
                        reject(error);
                    }
                };
                templateInput.oncancel = cancelSelection;
                window.addEventListener('focus', handleWindowFocus);
                templateInput.click();
            });

            let templateBuffer;
            if (window.location.protocol === 'file:') {
                showToast('Seleccione el Word oficial', 'Por seguridad, el navegador necesita que seleccione la plantilla Word guardada en esta carpeta.');
                templateBuffer = await selectLocalTemplate();
            } else {
                try {
                    const templateUrl = new URL('documents/Formato de inscripción en la Iniciativa de SV organizacional.docx', window.location.href);
                    const response = await fetch(templateUrl);
                    if (!response.ok) throw new Error(`Archivo no disponible (${response.status}).`);
                    templateBuffer = await response.arrayBuffer();
                } catch (fetchError) {
                    showToast('Seleccione el Word oficial', 'No se pudo cargar automáticamente. Seleccione la plantilla Word para continuar.');
                    templateBuffer = await selectLocalTemplate();
                }
            }

            const zip = await JSZip.loadAsync(templateBuffer);
            const documentFile = zip.file('word/document.xml');
            if (!documentFile) throw new Error('La plantilla Word no contiene el documento esperado.');

            const parser = new DOMParser();
            const serializer = new XMLSerializer();
            const wordNamespace = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
            const xmlNamespace = 'http://www.w3.org/XML/1998/namespace';
            const documentXml = parser.parseFromString(await documentFile.async('string'), 'application/xml');
            const table = documentXml.getElementsByTagNameNS(wordNamespace, 'tbl')[0];

            const directChildren = (node, localName) => Array.from(node.children).filter(child => child.localName === localName);
            const rows = directChildren(table, 'tr');

            function setWordCell(rowIndex, cellIndex, value) {
                const cells = directChildren(rows[rowIndex], 'tc');
                const cell = cells[cellIndex];
                let paragraph = cell.getElementsByTagNameNS(wordNamespace, 'p')[0];
                if (!paragraph) {
                    paragraph = documentXml.createElementNS(wordNamespace, 'w:p');
                    cell.appendChild(paragraph);
                }

                const originalRunProperties = paragraph.getElementsByTagNameNS(wordNamespace, 'rPr')[0];
                const preservedRunProperties = originalRunProperties ? originalRunProperties.cloneNode(true) : null;

                Array.from(paragraph.children).forEach(child => {
                    if (child.localName !== 'pPr') child.remove();
                });

                const run = documentXml.createElementNS(wordNamespace, 'w:r');
                if (preservedRunProperties) run.appendChild(preservedRunProperties);
                const textNode = documentXml.createElementNS(wordNamespace, 'w:t');
                textNode.setAttributeNS(xmlNamespace, 'xml:space', 'preserve');
                textNode.textContent = value || '';
                run.appendChild(textNode);
                paragraph.appendChild(run);
            }

            function setWordRichCell(rowIndex, cellIndex, segments) {
                const cell = directChildren(rows[rowIndex], 'tc')[cellIndex];
                const paragraph = cell.getElementsByTagNameNS(wordNamespace, 'p')[0];
                const originalRunProperties = paragraph.getElementsByTagNameNS(wordNamespace, 'rPr')[0];
                const baseRunProperties = originalRunProperties ? originalRunProperties.cloneNode(true) : null;

                Array.from(paragraph.children).forEach(child => {
                    if (child.localName !== 'pPr') child.remove();
                });

                segments.forEach(segment => {
                    const run = documentXml.createElementNS(wordNamespace, 'w:r');
                    const runProperties = baseRunProperties ? baseRunProperties.cloneNode(true) : documentXml.createElementNS(wordNamespace, 'w:rPr');
                    if (segment.bold && !runProperties.getElementsByTagNameNS(wordNamespace, 'b').length) {
                        runProperties.appendChild(documentXml.createElementNS(wordNamespace, 'w:b'));
                    }
                    run.appendChild(runProperties);
                    const textNode = documentXml.createElementNS(wordNamespace, 'w:t');
                    textNode.setAttributeNS(xmlNamespace, 'xml:space', 'preserve');
                    textNode.textContent = segment.text;
                    run.appendChild(textNode);
                    paragraph.appendChild(run);
                });
            }

            function centerWordCell(rowIndex, cellIndex) {
                const cell = directChildren(rows[rowIndex], 'tc')[cellIndex];
                const paragraph = cell.getElementsByTagNameNS(wordNamespace, 'p')[0];
                let paragraphProperties = directChildren(paragraph, 'pPr')[0];
                if (!paragraphProperties) {
                    paragraphProperties = documentXml.createElementNS(wordNamespace, 'w:pPr');
                    paragraph.insertBefore(paragraphProperties, paragraph.firstChild);
                }
                let alignment = directChildren(paragraphProperties, 'jc')[0];
                if (!alignment) {
                    alignment = documentXml.createElementNS(wordNamespace, 'w:jc');
                    paragraphProperties.appendChild(alignment);
                }
                alignment.setAttributeNS(wordNamespace, 'w:val', 'center');
            }

            const value = id => document.getElementById(id).value.trim();
            setWordCell(2, 1, value('fmt-company'));
            setWordCell(2, 3, value('fmt-ruc'));
            setWordCell(3, 1, value('fmt-legal-name'));
            setWordCell(3, 3, value('fmt-legal-type'));
            setWordCell(4, 3, value('fmt-legal-email'));
            setWordCell(5, 3, value('fmt-legal-doc'));
            setWordCell(6, 3, value('fmt-legal-phone'));
            setWordCell(7, 1, value('fmt-report-name'));
            setWordCell(7, 3, value('fmt-report-type'));
            setWordCell(8, 3, value('fmt-report-email'));
            setWordCell(9, 3, value('fmt-report-doc'));
            setWordCell(10, 3, value('fmt-report-phone'));
            setWordCell(11, 1, value('fmt-sector'));
            setWordCell(11, 3, value('fmt-address'));
            setWordCell(12, 1, `${value('fmt-department')} / ${value('fmt-province')} / ${value('fmt-district')}`);
            setWordCell(12, 3, value('fmt-location'));

            const activityRows = rows.slice(16, 27);
            const activityChecks = Array.from(document.querySelectorAll('.activity-check'));
            const beneficiaryInputs = Array.from(document.querySelectorAll('.beneficiary-input'));
            activityRows.forEach((row, index) => {
                setWordCell(16 + index, 2, activityChecks[index].checked ? 'X' : '');
                setWordCell(16 + index, 3, activityChecks[index].checked ? beneficiaryInputs[index].value : '');
                centerWordCell(16 + index, 2);
                centerWordCell(16 + index, 3);
            });

            setWordRichCell(28, 0, [
                { text: 'Yo, ' },
                { text: value('fmt-legal-name'), bold: true },
                { text: ' con Documento de Identidad ' },
                { text: value('fmt-legal-doc'), bold: true },
                { text: ', en representación de ' },
                { text: value('fmt-company'), bold: true },
                { text: ', declaro que la información consignada en el presente formato es veraz y me comprometo a cumplir con las actividades seleccionadas y reportar su cumplimiento en la plataforma tecnológica de la Dirección de Seguridad Vial del Ministerio de Transportes y Comunicaciones.' }
            ]);

            if (selectedFormatSignatureFile) {
                const signaturePng = await new Promise((resolve, reject) => {
                    const imageUrl = URL.createObjectURL(selectedFormatSignatureFile);
                    const image = new Image();
                    image.onload = () => {
                        const scale = Math.min(1, 700 / image.naturalWidth, 260 / image.naturalHeight);
                        const canvas = document.createElement('canvas');
                        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
                        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
                        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
                        URL.revokeObjectURL(imageUrl);
                        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('No se pudo procesar la firma.')), 'image/png');
                    };
                    image.onerror = () => {
                        URL.revokeObjectURL(imageUrl);
                        reject(new Error('La imagen de firma no es válida.'));
                    };
                    image.src = imageUrl;
                });

                const relationshipsFile = zip.file('word/_rels/document.xml.rels');
                const relationshipsXml = parser.parseFromString(await relationshipsFile.async('string'), 'application/xml');
                const relationshipNamespace = 'http://schemas.openxmlformats.org/package/2006/relationships';
                const signatureRelationshipId = 'rIdSignatureISVO';
                const relationship = relationshipsXml.createElementNS(relationshipNamespace, 'Relationship');
                relationship.setAttribute('Id', signatureRelationshipId);
                relationship.setAttribute('Type', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image');
                relationship.setAttribute('Target', 'media/firma-isvo.png');
                relationshipsXml.documentElement.appendChild(relationship);
                zip.file('word/_rels/document.xml.rels', serializer.serializeToString(relationshipsXml));
                zip.file('word/media/firma-isvo.png', signaturePng);

                const signatureCell = directChildren(rows[29], 'tc')[0];
                const signatureParagraphs = directChildren(signatureCell, 'p');
                const signatureLabelParagraph = signatureParagraphs.find(paragraph => paragraph.textContent.includes('FIRMA DEL REPRESENTANTE'));
                signatureParagraphs.forEach(paragraph => {
                    if (paragraph !== signatureLabelParagraph) paragraph.remove();
                });

                const drawingSource = `<w:p xmlns:w="${wordNamespace}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:pPr><w:jc w:val="center"/><w:spacing w:before="320" w:after="0" w:line="200" w:lineRule="auto"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="2286000" cy="914400"/><wp:docPr id="1000" name="Firma del Representante Legal"/><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="0" name="firma-isvo.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${signatureRelationshipId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="2286000" cy="914400"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/><a:ln><a:noFill/></a:ln></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
                const drawingXml = parser.parseFromString(drawingSource, 'application/xml');
                const signatureParagraph = documentXml.importNode(drawingXml.documentElement, true);
                signatureCell.insertBefore(signatureParagraph, signatureLabelParagraph || null);
            }

            zip.file('word/document.xml', serializer.serializeToString(documentXml));
            const completedDocument = await zip.generateAsync({
                type: 'blob',
                mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            });

            const safeCompanyName = value('fmt-company').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_-]+/g, '_').replace(/^_+|_+$/g, '') || 'Organizacion';
            const downloadUrl = URL.createObjectURL(completedDocument);
            const downloadLink = document.createElement('a');
            downloadLink.href = downloadUrl;
            downloadLink.download = `FORMATO_ISVO_${safeCompanyName}.docx`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            downloadLink.remove();
            URL.revokeObjectURL(downloadUrl);
            showToast('Word generado', 'Se descargó una copia del formato oficial con la información completada.');
        } catch (error) {
            if (error.name !== 'AbortError') {
                showToast('No se pudo generar el Word', error.message, 'error');
            }
        } finally {
            downloadButton.disabled = false;
            downloadButton.innerHTML = '<i class="fa-solid fa-file-word"></i> Descargar Word Oficial Llenado';
        }
    });

    updateFormatDeclaration();

    // ==========================================
    // 6. PREGUNTAS FRECUENTES (FAQ)
    // ==========================================
    const faqItems = document.querySelectorAll('.faq-item');
    const faqSearchInput = document.getElementById('faq-search-input');

    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        questionBtn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close other items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
            });

            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // Search filter for FAQs (only when the search field exists).
    if (faqSearchInput) {
        faqSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            faqItems.forEach(item => {
                const questionText = item.querySelector('.faq-question span').textContent.toLowerCase();
                const answerText = item.querySelector('.faq-answer p').textContent.toLowerCase();
                
                if (questionText.includes(query) || answerText.includes(query)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    // Prepare a WhatsApp message with the support form data.
    const contactForm = document.getElementById('contact-form');
    const contactRuc = document.getElementById('contact-ruc');

    contactRuc.addEventListener('input', () => {
        contactRuc.value = contactRuc.value.replace(/\D/g, '').slice(0, 11);
    });

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const ruc = contactRuc.value.trim();
        const name = document.getElementById('contact-name').value.trim();
        const message = document.getElementById('contact-msg').value.trim();

        if (ruc.length !== 11) {
            showToast('RUC Inválido', 'El RUC debe contener exactamente 11 números.', 'error');
            return;
        }

        const whatsappMessage = `Hola Dirección de Seguridad Vial.\n*RUC de la empresa:* ${ruc}\n*Nombre / Empresa:* ${name}\n*Consulta:* ${message}`;
        const whatsappUrl = `https://wa.me/51905461611?text=${encodeURIComponent(whatsappMessage)}`;

        const whatsappWindow = window.open(whatsappUrl, '_blank');
        if (whatsappWindow) {
            whatsappWindow.opener = null;
            contactForm.reset();
        } else {
            showToast('Ventana bloqueada', 'Permita las ventanas emergentes para abrir WhatsApp.', 'error');
        }
    });

    // ==========================================
    // 7. TOAST NOTIFICATIONS
    // ==========================================
    const toast = document.getElementById('toast-notification');
    const toastIcon = toast.querySelector('.toast-icon');
    const toastTitle = toast.querySelector('.toast-title');
    const toastMsg = toast.querySelector('.toast-message');
    let toastTimeout;

    function showToast(title, message, type = 'success') {
        // Reset timeout
        clearTimeout(toastTimeout);

        // Configure type
        if (type === 'success') {
            toast.style.borderLeftColor = 'var(--success)';
            toastIcon.className = 'fa-solid fa-circle-check toast-icon';
            toastIcon.style.color = 'var(--success)';
        } else if (type === 'error') {
            toast.style.borderLeftColor = 'var(--error)';
            toastIcon.className = 'fa-solid fa-triangle-exclamation toast-icon';
            toastIcon.style.color = 'var(--error)';
        }

        toastTitle.textContent = title;
        toastMsg.textContent = message;

        // Show toast
        toast.classList.remove('hidden');

        // Hide after 4 seconds
        toastTimeout = setTimeout(() => {
            toast.classList.add('hidden');
        }, 4000);
    }

    // ==========================================
    // 8. EFECTO DE CONFETI (CONFETTI ANIMATION)
    // ==========================================
    const confettiContainer = document.getElementById('confetti-container');

    function triggerConfetti() {
        const colors = ['#0f2042', '#ffab00', '#0288d1', '#2e7d32', '#d32f2f', '#ffeb3b'];
        const confettiCount = 80;

        for (let i = 0; i < confettiCount; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            
            // Random properties
            piece.style.left = `${Math.random() * 100}vw`;
            piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            piece.style.width = `${Math.random() * 8 + 6}px`;
            piece.style.height = `${Math.random() * 8 + 6}px`;
            piece.style.transform = `rotate(${Math.random() * 360}deg)`;
            
            // Animation values
            const delay = Math.random() * 1.5;
            const duration = Math.random() * 2 + 1.5;
            piece.style.animationDelay = `${delay}s`;
            piece.style.animationDuration = `${duration}s`;

            confettiContainer.appendChild(piece);

            // Cleanup piece after animation finishes
            setTimeout(() => {
                piece.remove();
            }, (delay + duration) * 1000);
        }
    }

    // ==========================================
    // 9. ANIMACIÓN DE NÚMEROS DE ESTADÍSTICAS
    // ==========================================
    const statNums = document.querySelectorAll('.stat-num');
    let animatedStats = false;

    function runStatsAnimation() {
        if (animatedStats) return;
        
        const options = {
            root: null,
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animatedStats = true;
                    
                    statNums.forEach(stat => {
                        const target = parseInt(stat.getAttribute('data-val'));
                        const duration = 2000; // ms
                        const stepTime = Math.abs(Math.floor(duration / target));
                        let current = 0;
                        
                        const timer = setInterval(() => {
                            current += 1;
                            stat.textContent = current;
                            if (current >= target) {
                                stat.textContent = target;
                                clearInterval(timer);
                            }
                        }, stepTime || 20);
                    });
                    
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        // Observe the stats grid parent
        const statsGrid = document.querySelector('.stats-grid');
        if (statsGrid) {
            observer.observe(statsGrid);
        }
    }

    // Run stats animation on initial load
    runStatsAnimation();
});
