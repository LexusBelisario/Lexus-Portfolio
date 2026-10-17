const svgFiles = import.meta.glob('../assets/**/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
})

const imageFiles = import.meta.glob('../assets/projects/**/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const docFiles = import.meta.glob(
  '../assets/projects/**/*.{pdf,doc,docx,ppt,pptx,xls,xlsx,zip}',
  {
    eager: true,
    query: '?url',
    import: 'default',
  },
)

const findSvg = (keyword) => {
  const path = Object.keys(svgFiles).find((key) =>
    key.toLowerCase().includes(keyword),
  )
  return path ? svgFiles[path] : ''
}

const shots = (id, size = 4) => {
  const urls = Object.entries(imageFiles)
    .filter(([path]) => path.includes(`/projects/${id}/`))
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([, url]) => url)

  return Array.from({ length: size }, (_, index) => urls[index] ?? '')
}

const docs = (id) =>
  Object.entries(docFiles)
    .filter(([path]) => path.includes(`/projects/${id}/`))
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([path, href]) => {
      const file = path.split('/').pop().replace(/^\d+[\s._-]+/, '')
      const label = file
        .replace(/\.[^.]+$/, '')
        .replace(/[-_\s]+/g, ' ')
        .trim()
      return { label, href, file }
    })

const lawchatUrl = 'https://chat-admin-front.vercel.app/'

const person = (name, role = '', leader = false) => ({ name, role, leader })

const tech = (label, keyword) => ({ label, src: findSvg(keyword) })

const react = tech('React', 'react')
const tailwind = tech('Tailwind CSS', 'tailwind')
const postgres = tech('PostgreSQL', 'postgres')
const python = tech('Python', 'python')
const css = tech('CSS3', 'css')
const java = tech('Java', 'java')
const arduino = tech('Arduino', 'arduino')
const c = tech('C', '/c.svg')
const vb = { ...tech('Visual Basic', 'visualbasic'), chip: true }
const database = tech('Database', 'database')
const fastapi = tech('FastAPI', 'fastapi')
const docker = tech('Docker', 'docker')
const qgis = tech('QGIS', 'qgis')
const pyqt = tech('PyQt5', 'pyqt')
const qtdesigner = tech('Qt Designer', 'qtdesigner')
const cpp = {
  label: 'C++',
  src: findSvg('cplusplus') || findSvg('cpp') || c.src,
}
const mysql = { ...database, label: 'MySQL' }

export const groups = [
  {
    id: 'school',
    title: 'School Projects',
    projects: [
      {
        id: 'gps-tracker',
        title: 'Arduino Nano-Based GPS Tracker',
        period: 'August 22, 2022 - December 20, 2022',
        stack: [java, arduino, cpp, mysql],
        description:
          'This is our first group project from our first Cognate-Electives subject. The system is based on a GPS Tracker that can track people wherever they go.',
        members: [
          person('Lexus Belisario', 'Project Leader, Developer, Hardware and Electronics', true),
          person('Dave Cabab', 'Backend Developer'),
          person('Ernesto Batang Jr.', 'Research and Development'),
          person('Jeric Durana', 'Papers and Documentation'),
          person('Cris John Andres', 'Hardware and Electronics'),
        ],
        more: {
          gallery: shots('gps-tracker'),
          captions: [
            'Home screen of the app: a satellite map with quick access tiles for Location, Map, and Emergency No.',
          ],
          documentation: docs('gps-tracker'),
          advisers: [{ label: 'Instructor', name: '' }],
          features: [
            "Tracks a person's location using GPS, with a GPS module connected to an Arduino Nano",
            'A client app built in Java, with a home screen that gives quick access to Location, Map, and Emergency No.',
            'A Location screen for checking where the tracked person is',
            'A Map screen with a satellite view of the area',
            'An Emergency No. screen for quick access to emergency numbers',
            "A backend and a MySQL database that store the app's data",
          ],
          outcome:
            "We finished a working concept of the system. It is a basic one, made to show how a person's location can be tracked with an Arduino Nano and viewed through an app, and it is not meant to be a full product. It was also our first group project in the subject, and we completed it.",
          challenges: [
            {
              challenge:
                'Getting the hardware and the software to work together, so that the location from the Arduino Nano ended up in the app.',
              learning:
                'We learned the basics of how a microcontroller, a GPS module, a backend, and an app can be connected into one simple system.',
            },
            {
              challenge:
                'It was our first group project in the subject, so we had to figure out how to split the work between the five of us, with some on the hardware, some on the backend, and some on the paper.',
              learning:
                "We learned how to divide the tasks and keep each person's part working together.",
            },
          ],
        },
      },
      {
        id: 'watch-dogs',
        title: 'Watch Dogs: Pet Services System',
        period: 'October 4, 2021 - December 15, 2021',
        stack: [vb, mysql],
        description:
          "A 2nd-year Advanced Programming project built with VB.NET alongside my classmate Dindo Reyes. Together we have finished the project. It's a management system for any pet stores, specifically with dogs, handling products and grooming services with a fun Watch_Dogs theme to it (it is powered by ctOS!).",
        members: [
          person('Lexus Belisario', 'Developer', true),
          person('Dindo Reyes', 'Co-Developer'),
        ],
        more: {
          gallery: shots('watch-dogs'),
          captions: [
            'The home screen, with the Watch Dogs logo and a menu for Home, Groom Reservation, Daycare Reservation, Shopping System, and Exit.',
            'The staff login screen, where staff sign in with their name and password. There is an admin option too.',
            'The grooming reservation form. It takes the owner and dog details, the grooming service, and the date, with a table of current customers below.',
            'The shopping system, where you pick the quantity of each product, check the total price, enter the cash, and proceed.',
          ],
          documentation: docs('watch-dogs'),
          advisers: [{ label: 'Instructor', name: 'Engr. Ronel Paglomutan' }],
          features: [
            'Staff log in with their own account, and there is a separate admin account too',
            'Reservations for grooming and daycare, where you fill in the owner and dog details, pick the service and date, and pay',
            'A list of current customers that you can add to, edit, delete from, or clear',
            'A shopping system for pet products, where you choose the quantity, see the total price, enter the cash, and proceed',
            'Everything is saved in a MySQL database, from the accounts and products to the reservations',
            'A Watch_Dogs and ctOS theme all around, from the logo to the cloudy backgrounds',
          ],
          outcome:
            'We finished the whole system and it worked fully, from logging in to reservations to the shopping system. It placed 4th best system, and it also used a MySQL database for the accounts, the products in the shopping system, the reservations, and the admin account.',
          challenges: [
            {
              challenge:
                'This was our first time pairing MySQL with Visual Basic. We had been using Visual Basic for months and learned the basics in class, but connecting a database went beyond the basics we were taught.',
              learning:
                'It was the first time we successfully connected a database to Visual Basic.',
            },
          ],
        },
      },
      {
        id: 'autoaquamans',
        title: 'Automated Aquaculture Monitoring System (AutoAquaManS)',
        period: 'August 12, 2024 - March 1, 2025',
        stack: [python, database, arduino, react, c, tailwind],
        description:
          'Our Capstone Project, an IoT and machine learning system for monitoring catfish. It tracks water quality, uses YOLOv10 to count fish and detect mortality, and alerts users through a web dashboard.',
        members: [
          person('Lexus Belisario', 'Project Leader, Software Development and Hardware Calibration', true),
          person('Ernesto Batang Jr.', 'Research and Development, Labeling and Training Data Preparation'),
          person('Jeric Durana', 'Papers and Documentation, Hardware and Electronics'),
          person('John Daniel Furaque', 'Hardware and Electronics and Labeling and Training Data Preparation'),
          person('Nica Corpuz', 'Papers and Documentation'),
        ],
        more: {
          gallery: shots('autoaquamans', 8),
          captions: [
            'The main dashboard. It shows the live temperature, oxygen, pH, and water turbidity readings, along with the number of alive, dead, and total catfish. Alerts and captured images appear below.',
            'An alert for a dead catfish. It lists the water readings at that moment and the possible causes, and the report can be downloaded. Below it is the captured image, with the catfish boxed in red.',
            'The live monitoring page, showing the camera feed of the fish tank. Every catfish the system detects is boxed in green, with the live and dead counts on screen.',
            'The graphs section, with weekly charts for temperature, oxygen, pH, and turbidity. Each chart has a filter to change the time range.',
            'Our hardware setup beside the fish tank. The Arduino and sensors are wired to the computer that runs the system.',
            'The data logs page, a table of every saved reading: temperature, oxygen, pH, turbidity, and the alive and dead catfish counts, each with its time. It can be filtered by date.',
            'Labeling our training images in CVAT. We drew boxes around the catfish, including the dead ones, so the YOLO model could learn to detect them.',
            'The AutoAquaManS team. Along with our adviser Engr. Ronel Paglomutan.',
          ],
          documentation: docs('autoaquamans'),
          visit: {
            label: 'View on GitHub',
            href: 'https://github.com/LexusBelisario/AquaAutoManS',
          },
          advisers: [
            { label: 'Thesis adviser', name: 'Engr. Ronel Paglomutan' },
            { label: 'Instructor', name: 'Engr. Rizal Laqui' },
          ],
          features: [
            'Water quality monitoring: temperature, pH, dissolved oxygen, and turbidity',
            'Fish counting using YOLOv10 computer vision',
            'Fish mortality detection',
            'Alerts/Notifies users through a web dashboard when the water quality of the aquarium is poor or when there is a fish mortality',
            'Generate a report of the water quality and fish count',
            'Live feed of the fish tank through a camera, with the ability to take pictures when a catfish is detected as dead.',
          ],
          outcome:
            'We finished the system and defended it in front of five panelists, including a statistician who checked the data we gathered. We then adjusted and tailored the system to what the panel asked for, and in the end we successfully hardbound our thesis.',
          challenges: [
            {
              challenge:
                'Time was usually our biggest challenge. We had to build the system, gather our data, and write the thesis within a limited schedule.',
              learning:
                'We learned how to manage our time, and how to set our goals and priorities as a group.',
            },
            {
              challenge:
                'The concept itself was hard. Automated monitoring of an aquaculture environment was the biggest system we had ever created, and it was our first time building something at that scale.',
              learning:
                'We learned how to bring sensors, a camera with computer vision, and a web dashboard together into one working system.',
            },
            {
              challenge:
                'Defending our work in front of five panelists, with a statistician checking the data we gathered.',
              learning:
                'We learned how to explain and back up our work with our data, and how to take the panel\'s feedback and adjust the system to it.',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'work',
    title: 'Work Projects',
    projects: [
      {
        id: 'lawchat',
        title: 'LawChat Dashboard',
        period: 'March 4, 2024 - April 30, 2024',
        stack: [react, tailwind],
        description:
          'My first web app, built during my OJT at Intelliseven with two fellow interns whom I led. It is the admin site of a chat app, used to manage user accounts and plans. I handled most of the front end, turning Figma designs into responsive React and Tailwind CSS interfaces connected to an Express.js backend.',
        members: null,
        more: {
          gallery: null,
          documentation: docs('lawchat'),
          visit: { label: 'Visit live site', href: lawchatUrl },
          features: [
            'Dashboard overview of total users, companies, and plans, each linking to its full list',
            'Users per company chart',
            'Management of user accounts and plans',
            'Sidebar navigation across the Dashboard, Plan, Company, User, and Settings pages',
            'Responsive interface built from Figma mockups',
            'Account data fetched, displayed, and updated through an Express.js backend using React hooks',
          ],
          challenges: [
            {
              challenge:
                'It was my first time building a website. I did not know the basics of HTML and CSS when the internship started, and I had to learn React JS and Tailwind CSS from scratch and quickly.',
              learning:
                'I ended the internship with a solid grasp of HTML, CSS, React JS, and Tailwind CSS, learned while building the dashboard.',
            },
            {
              challenge: 'Translating Figma designs into working React JS pages.',
              learning:
                'I learned how to turn Figma mockups into responsive React and Tailwind CSS interfaces.',
            },
          ],
        },
      },
      {
        id: 'blgf',
        title: 'BLGF Web App',
        period: 'August 11, 2025 - Present',
        stack: [react, tailwind, postgres, python, fastapi, css],
        description:
          'A fullstack project at Integrated Geosys Development Inc. where I modernized the BLGF GIS Web Application. I took charge of the UI/UX redesign using React and Tailwind, built FastAPI endpoints and PostgreSQL schemas for role-based auth (Municipal vs. Provincial), and developed GIS features like parcel subdivision, consolidation, and a Spatial Data Manager for PostGIS datasets (.shp, .gpkg).',
        members: null,
        more: {
          gallery: shots('blgf', 8),
          captions: [
            'The login page of the Local GIS App, where users sign in with their username and password.',
            'The main map for the Province of Bataan. The panel on the left holds the GIS tools, like Search, Subdivide, Consolidate, and Taxmap Layout, and the municipality can be switched on the map.',
            'The Parcel History tool, which lists the changes made to a parcel over time, such as a consolidation that was reverted.',
            'The Taxmap Layout tool. It prepares printable maps, like section index maps and property identification maps, from the database or an uploaded ZIP, in the chosen paper size.',
            'The User Management page for the Province of Cavite, where admins add users and set which municipality or city each one can access.',
            'The Import Tool, where shapefiles, GeoPackages, and ZIP files are dragged in and queued before they are imported into the assigned database.',
            'The Data Manager, where admins browse the database tables, such as a land parcel table with over 15,000 rows, and can search, export, or preview them on a map.',
            'The Map Viewer, which shows the polygons of a table on a street or satellite map. The shapes are simplified so large layers stay fast.',
          ],
          documentation: docs('blgf'),
          features: [
            'A redesigned, more modern interface for the whole GIS web application',
            'Logins with separate access for Municipal and Provincial users, plus an admin side for managing users and user groups',
            'Parcel search and a land parcel info tool for looking up a parcel on the map',
            'Subdivide, which splits one parcel into smaller parcels',
            'Consolidate, which merges parcels into one',
            'Parcel History and Audit Trail, so changes to a parcel can be traced, like a consolidation that was reverted',
            'Taxmap Layout, which prepares printable maps like section index maps and property identification maps',
            'TMCR and Matching reports, plus thematic maps, label tools, and landmark tools',
            'An Import Tool for uploading shapefiles, GeoPackages, and ZIP files into the assigned database',
            'A Data Manager for browsing, searching, and exporting spatial tables, with a Map Viewer to preview them on a street or satellite map',
          ],
          challenges: [
            {
              challenge:
                'Modernizing an existing GIS web application, where the interface, the backend, and the database all had to be redesigned together.',
              learning:
                'I learned how to take on a full stack project from end to end, from the interface to the API to the database.',
            },
            {
              challenge:
                'Working with large spatial data, like parcel layers with more than fifteen thousand records, without making the map or the tables slow.',
              learning:
                'I learned how to work with PostGIS and spatial files like shapefiles and GeoPackages, and how to keep big map layers fast, for example by simplifying their shapes.',
            },
            {
              challenge:
                'Giving Municipal and Provincial users the right level of access to the right data.',
              learning:
                'I learned how to structure users, groups, and permissions in both the database and the API.',
            },
          ],
        },
      },
      {
        id: 'cama-ai-tools',
        title: 'AI Tools - Computer Assisted Mass Appraisal',
        period: 'March 4, 2024 - April 30, 2024',
        stack: [react, python, fastapi, postgres, docker, css],
        description:
          'A mostly solo-developed AI module for Computer Assisted Mass Appraisal (CAMA) that predicts land values for parcels that lack unit values. It trains XGBoost, Random Forest, and Linear Regression models, shows the results in charts and on the map, and exports shapefiles and PDF reports. It started inside the BLGF GIS web app and now runs as a standalone app that the web app opens through a token. Fully Dockerized for VM deployment.',
        members: null,
        more: {
          gallery: shots('cama-ai-tools', 20),
          captions: [
            'First version, inside the BLGF GIS web app. The Train tab, where you choose between an uploaded shapefile or a database training table, pick the value to predict and its factors, select the models, and preview the data.',
            'First version. The Results tab for Linear Regression, with downloads for the model, the PDF report, the shapefile, and the CSV, buttons to show the results on the map or save them to the database, and the performance metrics. The map panel on the left colors every parcel by its predicted value.',
            'First version. Hovering over a parcel shows its actual value, its predicted value, and the residual, with a note that this one was a good prediction.',
            'First version. Another parcel, this time under-predicted. The popup shows the actual value, the predicted value, and how far off the prediction was.',
            'First version. The metrics, the feature importance as a table and a chart, and the start of the coefficients analysis with its t-tests.',
            'First version. The rest of the coefficients analysis, the residual t-test, and a preview of the training results table.',
            'First version. The Plots page, where the actual and predicted values are compared against a reference line.',
            'First version. The residual distribution, a histogram of how far the predictions were from the actual values.',
            'First version. The Distributions page, with a histogram for each variable and its mean, median, standard deviation, and number of samples.',
            'First version. More variable distributions, one chart for each factor used in the model.',
            'First version. The Run Saved tab, where a saved model is chosen or uploaded and run on a database table or on uploaded files.',
            "Standalone version, opened from the BLGF GIS web app through the user's token. The Train tab shows the connection to the user's municipality, the model choices, the training table, the target, and the factors.",
            'Standalone version. The data preview, where each row has a tick box to leave it out, with page-by-page navigation and the Train Selected Models button.',
            'Standalone version. The Results tab for Linear Regression, with links to download the model, the PDF report, the shapefile, and the CSV.',
            'Standalone version. The performance metrics and the feature importance, as a table and as a chart.',
            'Standalone version. The coefficients analysis with its t-tests, and a preview of the predictions next to each parcel PIN.',
            'Standalone version. The actual versus predicted plot.',
            'Standalone version. The residual distribution.',
            'Standalone version. The distributions of the variables used in the model, each with its mean, median, standard deviation, and number of samples.',
            'Standalone version. More variable distributions.',
          ],
          documentation: docs('cama-ai-tools'),
          features: [
            'Train three kinds of models side by side, Linear Regression, Random Forest, and XGBoost, then compare how each one performs',
            'Pick a training table from the database or upload a shapefile or ZIP, choose the value to predict and the factors that affect it, and preview the data page by page before training',
            'Leave out individual rows, like outliers, with a simple tick box before training',
            'Clear performance numbers (R², RMSE, and MAE), with charts for feature importance, actual versus predicted values, the residuals, and the distribution of every variable',
            'For Linear Regression, a full coefficients analysis with t-tests and p-values',
            'A map view that colors every parcel by its predicted value, with a legend, summary statistics, and a switch between actual and predicted values',
            'Hover over a parcel to see its actual value, its predicted value, and the residual, with a note on how good the prediction was',
            'A multi-page PDF report for every model that explains the results in plain language',
            'Predictions exported as a shapefile and a CSV, with the trained model saved as a file so it can be used again',
            'Trained models saved automatically to the database, so they can be run again later',
            'Run Saved Model: use a saved model, from the database or an uploaded file, on a table or on shapefiles, and get predictions, a report, and a shapefile',
            'Write the predictions back into the table by PIN',
            "Runs as a standalone app that the GIS web app opens with the user's token, which connects it to the right municipality data",
          ],
          contributions: [
            'Built the module from end to end: the React interface, the FastAPI backend, and the Docker setup for deployment.',
            'Wrote the training pipeline for the three models, from reading the data and cleaning it, to splitting it for testing, to measuring how well each model predicts.',
            'Built the PDF report generator, which turns the metrics and charts into pages with explanations that non-technical users can follow.',
            'Built the map view that colors parcels by predicted value, with the hover details for each parcel.',
            'Built the Run Saved Model flow, which loads a saved model, predicts on new data, and can write the predictions back to the table by PIN.',
            'Connected everything to PostGIS: reading training tables, joining attributes with their spatial tables, and saving trained models and predictions.',
            'Moved the module out of the BLGF GIS web app into a standalone app that the web app opens through a token, so it can be updated and deployed on its own.',
          ],
          challenges: [
            {
              challenge:
                'Keeping every prediction tied to the right parcel. Rows get excluded or dropped along the way, so the predictions no longer line up with the original table.',
              learning:
                'I learned to carry the original row index and the PIN through the whole pipeline, so every prediction can be matched back to the right parcel on the map and in the database.',
            },
            {
              challenge:
                'Making the results understandable for non-technical users, since numbers like R² and RMSE mean little to most people.',
              learning:
                'I learned to turn the numbers into plain-language explanations, in the charts and in the PDF report.',
            },
            {
              challenge:
                'Supporting both database tables and uploaded files as data sources, when the tables do not always carry the parcel shapes.',
              learning:
                'I learned how to join attribute tables with their spatial tables in PostGIS, and how to read shapefiles and ZIP files safely.',
            },
            {
              challenge:
                'Moving the module out of the web app so it works on its own, while still knowing who the user is and which municipality they are allowed to use.',
              learning:
                "I learned how to pass identity and access between apps with tokens, and how to keep each user limited to their own municipality's data.",
            },
          ],
        },
      },
      {
        id: 'igeosys-lgu-suite',
        title: 'iGeosys LGU Suite',
        period: 'March 2026 - Present',
        stack: [python, pyqt, qgis, postgres],
        description:
          'A GIS desktop application based on QGIS, rebranded into our very own at Integrated Geosys Development Inc., with unique features made for Local Government Units. It is still in development, and I work on its forms, layer tools, and installer.',
        members: null,
        more: {
          gallery: shots('igeosys-lgu-suite', 8),
          captions: [
            'The main window of iGeosys LGU Suite, with a land parcel layer loaded and the Forms Toolbar open to the two DCS forms, Residential and Commercial or Industrial. The Tax Mapping System panel on the right holds the parcel, transaction, report, label, and landmark tools.',
            'The Field Appraisal and Assessment Sheet for land. The first page covers the data information, property details, owner, and location, and the form saves straight to the layer.',
            'The Real Property Data Collection Sheet for residential properties. Its first part covers the reference numbers, the address, the land area and value, and the building details, and it also saves straight to the layer.',
            "The Symbology page of the Layer Properties window. It is QGIS's own symbology editor, placed inside the suite's window.",
            'The Display page, where you set the display name used in search and identify results, and the map tips that show when you hover over a feature.',
            "The Attributes Form page, where you pick which fields appear in the form, arrange them, and set each field's alias, widget type, and constraints.",
            "The Style menu in Layer Properties. From here a layer's style can be loaded or saved as iGML, our own style format, or saved as the default and restored to it.",
            'The Labels page, where you choose the field or expression to show, then set the font, size, color, buffer, and placement.',
          ],
          documentation: docs('igeosys-lgu-suite'),
          features: [
            'A unified Forms Toolbar for the Field Appraisal and Assessment Sheet (FAAS) for Land, Building, and Machinery, and for the Data Collection Sheet (DCS), laid out like the official paper forms that field and local tax assessors use to record the value of a real property',
            'Helpful form touches, like PIN auto-fill and highlights on the fields you have changed but not saved yet',
            'A Tax Mapping System panel with the tools used in tax mapping: parcel search and info, consolidate, subdivide, resection and repin, technical descriptions, TMCR and matching reports, land legends, and label and landmark tools',
            "A Layer Properties window with pages for General, Symbology, Labels, Display, Information, Attributes Form, CRS, and Identification, all in the suite's own look",
            "Symbology and Attributes Form editors that come straight from QGIS, built right into the suite's own window",
            'Labels and Display settings, like the label font, color, and placement, and the map tips that show when you hover over a feature',
            "iGML, our own version of QML, so a layer's style can be loaded, saved, or set as the default from the Style menu",
            'Digitizing toolbars that only enable the tools that fit the layer you are editing: point, line, or polygon',
            'An installer that sets up the database side of the suite: PostgreSQL, PostGIS, and the municipal and provincial base maps',
          ],
          contributions: [
            'Built the FAAS and DCS forms. These are the official forms that field assessors and local tax assessors use to record the details of a real property and calculate its value. The FAAS Land form, for example, runs across three pages, and its first page covers the data information, property details, owner, and location. The DCS, or Real Property Data Collection Sheet, comes in Residential and Commercial or Industrial versions and runs across four parts. Its first part covers the reference numbers, address, land area, land value, and building details.',
            'Built the unified Forms Toolbar that replaced the old FAAS toolbar, with one dropdown for the FAAS forms and another for the DCS forms, each with keyboard shortcuts.',
            'Made saving run in the background, so the app no longer freezes on big datasets, and added touches like PIN auto-fill, colored borders on edited fields, and a banner for unsaved changes.',
            'Worked around the 10-character limit of shapefile field names by shortening the form fields, and wrote a one-time migration tool that rebuilds the columns and keeps a backup of the shapefile.',
            "Built the Layer Properties window, bringing QGIS's own symbology and attributes form modules into the suite's window, and loading its pages gradually so it opens without freezing.",
            'Helped build iGML, our own version of QML, with Load, Save, Save as Default, and Restore Default options in the Style menu.',
            'Fixed bugs in the digitizing toolbars, and made the advanced toolbar disable the tools that do not fit the layer, depending on whether it is a point, line, or polygon layer.',
            'Built the installer that sets up PostgreSQL, PostGIS, and the municipal and provincial base maps for the suite.',
            'Updated the code to keep up with newer QGIS versions, like the changes in QGIS 3.40 and above.',
          ],
          challenges: [
            {
              challenge:
                'Saving to PostGIS froze the whole interface when the dataset was big.',
              learning:
                "I learned how Qt's main thread works, and how to move heavy work like saving into background threads so the app stays responsive.",
            },
            {
              challenge:
                'Shapefiles limit field names to 10 characters, while the paper forms we mirrored have long, detailed fields.',
              learning:
                'I learned to plan around file format limits, shorten and map the field names carefully, and always back up the data before migrating it.',
            },
            {
              challenge:
                'Making the setup easy for non-technical users, when the app depends on a database that normally takes manual work to install and configure.',
              learning:
                'I learned how installers, database services, and automated setup scripts work, so the database side can be set up with much less manual work.',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'personal',
    title: 'Personal Projects',
    projects: [
      {
        id: 'wd-recreation',
        title: 'Recreation of the WD: Pet Service System',
        period: 'Currently on planning stage',
        stack: [],
        description:
          'A recreation of my Watch Dogs-themed pet store management system from school, rebuilt as a modern web app. This is my personal solo project, and it is still in the designing phase on Figma and in the planning stage. I have not picked the tech stack yet, since I will choose the one that best fits the project.',
        members: null,
        more: null,
      },
    ],
  },
]