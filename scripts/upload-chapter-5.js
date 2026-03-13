// Direct upload script for Chapter 5
const http = require('http');

const chapter5Data = {
  chapters: [
    {
      id: "chapter-5",
      title: "Architecture and Monuments Under Harsha",
      subtitle: "Building an empire's legacy",
      sections: [
        {
          title: "Temples of Faith and Power",
          body: "Harsha's reign saw significant architectural development across his empire. He understood that impressive buildings could demonstrate both his devotion to the gods and his authority as a ruler. Temples constructed during his time featured intricate stone carvings, tall spires, and spacious halls for worshippers."
        },
        {
          title: "Patronage of Buddhist Institutions",
          body: "As a devoted Buddhist, Harsha provided generous support for monasteries and stupas. He funded the construction of new meditation halls, libraries for sacred texts, and living quarters for monks. These institutions became centers of learning and spiritual practice that attracted scholars from across Asia."
        },
        {
          title: "Educational Centers",
          body: "Harsha established universities and learning centers that combined religious instruction with secular subjects. Students studied mathematics, astronomy, medicine, and literature alongside Buddhist philosophy. These institutions helped preserve knowledge and promote intellectual exchange between different regions."
        },
        {
          title: "Urban Development",
          body: "Cities under Harsha's rule saw major improvements in infrastructure. Wide roads, public water systems, and marketplaces were built to accommodate growing populations. The architectural style blended traditional Indian elements with influences from neighboring regions, creating a distinctive Harsha-era aesthetic."
        },
        {
          title: "Legacy in Stone",
          body: "The buildings and monuments from Harsha's time continue to stand as testaments to his vision. They represent not just architectural achievement but the cultural and religious values that shaped his empire. These structures served as gathering places for communities and symbols of the empire's prosperity and stability."
        }
      ]
    }
  ],
  action: "direct-upload",
  autoEmbed: true
};

const postData = JSON.stringify(chapter5Data);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/embeddings/migrate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('📤 Uploading Chapter 5 to OpenAI Vector Store...');

const req = http.request(options, (res) => {
  console.log(`📊 Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      if (response.success) {
        console.log('✅ Chapter 5 uploaded successfully!');
        console.log('📋 Result:', JSON.stringify(response.result, null, 2));
      } else {
        console.log('❌ Upload failed:', response.error);
      }
    } catch (e) {
      console.log('📄 Response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Error:', e.message);
});

req.write(postData);
req.end();

console.log('🚀 Request sent!');
