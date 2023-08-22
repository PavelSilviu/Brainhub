# LICENTA

<p>Dezvoltarea unei aplicații de social media folosind arhitectura MVC și expunerea de servicii API pentru interacțiunea cu alte platforme</p>
<ul>
<li>API pentru crearea, editarea și ștergerea profilurilor utilizatorilor - acest API va permite utilizatorilor să își creeze, să își editeze și să își șteargă profilurile din aplicația de social media.</li>
<li>API pentru crearea, editarea și ștergerea postărilor - acest API va permite utilizatorilor să creeze, să editeze și să șteargă postări în aplicația de social media.</li>
<li>API pentru comentarii și aprecieri - acest API va permite utilizatorilor să comenteze și să aprecieze postările altor utilizatori din aplicație.</li>
<li>API pentru notificări - acest API va permite aplicației să trimită notificări utilizatorilor atunci când aceștia primesc noi aprecieri sau comentarii la postările lor.</li>
<li>API pentru căutare - acest API va permite utilizatorilor să caute postări și utilizatori în aplicație.</li>
<li>API pentru raportarea abuzurilor - acest API va permite utilizatorilor să raporteze abuzuri, precum spam sau conținut inadecvat, în aplicația dvs. de social media.</li>
</ul>

Pachete folosite: express, ejs, sequelize, nodemon?, path(pt sequelize), fs(pt sequelize), passport(autorizare), dotenv(pt a ascunde secrete de git), stocare sesiune cu express-session si jsonwebtoken?, bcrypt pt criptare pass, font-awesome-free, faker, multer(img upload), ejs lint, swagger-ui-express, swagger-autogen(open api doc)<br>
Routing system de la expressjs <br><br>

<div>
<h3>Flow-ul pentru o aplicație web MVC în Node.js cu Express</h3>
<p>Flow-ul general pentru o aplicație web MVC în Node.js cu Express poate fi descris în următorii pași:</p>
<ol>
  <li><strong>Model:</strong> Crearea modelelor de date pentru aplicație, care definesc structura datelor și interacțiunea cu baza de date. Aceste modele pot fi create folosind biblioteci precum Sequelize sau Mongoose.</li>
  <li><strong>Controller:</strong> Crearea controlerelor, care gestionează interacțiunea între modele și vizualizări. Acestea pot fi create pentru fiecare entitate din aplicație (de exemplu, utilizatori, postări, comentarii) și sunt responsabile pentru procesarea datelor de intrare și pentru a returna datele la vizualizare.</li>
  <li><strong>View:</strong> Crearea șabloanelor de vizualizare, care definesc aspectul și interacțiunea cu utilizatorul. Acestea pot fi create cu ajutorul unui motor de șabloane, cum ar fi Pug, EJS sau Handlebars.</li>
  <li><strong>Router:</strong> Crearea rutelor, care definesc modul în care aplicația răspunde la cererile HTTP. Acestea pot fi create folosind Express.js și sunt responsabile pentru gestionarea cererilor și pentru a îndruma cererea către controllerul potrivit.</li>
  <li><strong>Middleware:</strong> Adăugarea de middleware, care poate fi utilizat pentru a gestiona diferite aspecte ale aplicației, cum ar fi gestionarea erorilor, autentificarea și autorizarea.</li>
  <li><strong>Conectarea cu baza de date:</strong> Conectarea aplicației cu baza de date pentru a permite comunicarea cu modelele.</li>
  <li><strong>Testare:</strong> Testarea aplicației pentru a asigura funcționarea corectă și pentru a evita erorile.</li>
</ol>
</div>

<div>
<h3>Flow-ul pentru utilizator când intră în aplicație</h3>
<ol>
  <li><strong>Login</strong> Userul se loghează în aplicatie cu email-ul și parola sau folosind Github</li>
  <li><strong>Register</strong> Deși pare greu de crezut... există programatori care nu au github, cel putin la început:) sau care poate că nu doresc să își introducă Github înainte să vadă daca această aplicație este pentru ei.</li>
  <li><strong>Home</strong> Userul va primi un pop-out în care va primi niște sugestii de follow, persoanele care sunt conectate cu cei mai mulți useri de pe platformă pentru a primi noile lor postări.</li>
  <li><strong>Home</strong> Conform principiilor UI/UX, putem converti ușor useri dacă ei sunt familiari cu funcționalități ale altor aplicații asemănătoare. Userul deci va avea în partea de sus a paginii posibilitatea de a crea un post, asemeni Facebook</li>
</ol>
</div>

<div>
<h3>Flow-ul pentru relatia de following</h3>
<ol>
  <li>Un utilizator A dorește să înceapă să urmărească un utilizator B, așadar trimite o cerere de urmărire către B.</li>
  <li>Cererea de urmărire este adăugată în baza de date ca o urmărire în așteptare, cu ID-urile de utilizator A și B, precum și data și ora solicitării.</li>
  <li>Utilizatorul B primește cererea de urmărire și are două opțiuni: poate accepta cererea sau o poate ignora.</li>
  <li>Dacă utilizatorul B acceptă cererea de urmărire, starea urmăririi este actualizată în baza de date de la "pending" la "accepted".</li>
  <li>Dacă utilizatorul B ignoră cererea, urmărirea în așteptare rămâne în baza de date cu starea "pending".</li>
  <li>Utilizatorul A poate vedea statusul cererii sale de urmărire din pagina de profil și poate anula cererea dacă dorește.</li>
  <li>Dacă urmărirea este acceptată, utilizatorul A începe să primească actualizări din partea utilizatorului B și poate vedea postările acestuia în fluxul său de activitate.</li>
  <li>Dacă utilizatorul A anulează cererea de urmărire sau utilizatorul B îi elimină pe A din lista sa de urmăritori, urmărirea este eliminată din baza de date.</li>
</ol>
