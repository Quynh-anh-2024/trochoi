import { GameIdea } from "../types";

// Declare global variables for Google APIs
declare var gapi: any;
declare var google: any;

const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const FOLDER_NAME = 'TRÒ CHƠI HỌC TẬP';

export const initGoogleDrive = async (clientId: string, apiKey: string) => {
  return new Promise<void>((resolve, reject) => {
    gapi.load('client', async () => {
      try {
        await gapi.client.init({
          apiKey: apiKey, // Drive API Key (optional for implicit flow but good for discovery)
          discoveryDocs: [DISCOVERY_DOC],
        });
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  });
};

export const signInAndSaveToDrive = async (clientId: string, idea: GameIdea, subject: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: async (tokenResponse: any) => {
        if (tokenResponse && tokenResponse.access_token) {
          try {
            const fileLink = await saveGameToFolder(idea, subject);
            resolve(fileLink);
          } catch (error) {
            reject(error);
          }
        } else {
          reject("Login failed");
        }
      },
    });
    tokenClient.requestAccessToken();
  });
};

const saveGameToFolder = async (idea: GameIdea, subject: string): Promise<string> => {
  // 1. Search for folder
  let folderId = '';
  const folderQuery = `mimeType = 'application/vnd.google-apps.folder' and name = '${FOLDER_NAME}' and trashed = false`;
  
  const folderRes = await gapi.client.drive.files.list({
    q: folderQuery,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  if (folderRes.result.files && folderRes.result.files.length > 0) {
    folderId = folderRes.result.files[0].id;
  } else {
    // 2. Create folder if not exists
    const folderMetadata = {
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    };
    const createRes = await gapi.client.drive.files.create({
      resource: folderMetadata,
      fields: 'id',
    });
    folderId = createRes.result.id;
  }

  // 3. Create File Content (HTML to be converted to Doc)
  const fileContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          h1 { color: #1a73e8; }
          h2 { color: #e37400; border-bottom: 2px solid #e37400; padding-bottom: 5px; margin-top: 20px; }
          .highlight { background-color: #f1f3f4; padding: 10px; border-radius: 5px; }
          ul { margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <h1>${idea.title}</h1>
        <p><strong>Môn học:</strong> ${subject}</p>
        <p><strong>Thời gian:</strong> ${idea.duration} | <strong>Độ vui:</strong> ${idea.funFactor}</p>
        <p><em>${idea.description}</em></p>
        
        <div class="highlight">
          <strong>Mục tiêu bài học:</strong> ${idea.learningGoal}
        </div>

        <h2>1. Chuẩn bị</h2>
        <ul>
          ${idea.preparation.map(p => `<li>${p}</li>`).join('')}
        </ul>

        <h2>2. Cách tổ chức</h2>
        <ol>
          ${idea.steps.map(s => `<li>${s}</li>`).join('')}
        </ol>

        <h2>3. Hệ thống thưởng</h2>
        <ul>
          <li><strong>Cơ chế:</strong> ${idea.rewardDetails.mechanic}</li>
          <li><strong>Danh hiệu:</strong> ${idea.rewardDetails.badges}</li>
          <li><strong>Phản hồi:</strong> ${idea.rewardDetails.feedback}</li>
        </ul>

        <h2>4. Ngân hàng câu hỏi</h2>
        ${idea.quizExamples.map((q, i) => `
          <p><strong>Câu ${i + 1} (${q.type}):</strong> ${q.question}</p>
          <p style="color: green;"><em>Đáp án: ${q.answer}</em></p>
          <hr/>
        `).join('')}
      </body>
    </html>
  `;

  // 4. Upload File
  const boundary = '-------314159265358979323846';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";

  const contentType = 'application/vnd.google-apps.document'; // Convert to Google Doc
  const metadata = {
    name: `[${subject}] ${idea.title}`,
    mimeType: contentType,
    parents: [folderId],
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/html\r\n\r\n' +
    fileContent +
    close_delim;

  const request = gapi.client.request({
    'path': '/upload/drive/v3/files',
    'method': 'POST',
    'params': {'uploadType': 'multipart'},
    'headers': {
      'Content-Type': 'multipart/related; boundary="' + boundary + '"'
    },
    'body': multipartRequestBody
  });

  const file = await request;
  return `https://docs.google.com/document/d/${file.result.id}/edit`;
};
