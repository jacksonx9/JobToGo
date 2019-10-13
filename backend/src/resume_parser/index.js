import ResumePraser from 'resume-parser';
import fs from 'fs';
import retext from 'retext';
import pos from 'retext-pos';
import keywords from 'retext-keywords';
import toString from 'nlcst-to-string';
import pdf from 'pdf-parse';

// temp name b/c conflict with library
class OurResumeParser {
    // TODO: change to passing in User and getting user's keywords
    async parseResume(resume) {
        let dataBuffer = fs.readFileSync(resume);

        pdf(dataBuffer).then(function(data) {
          const k = new Set();
          fs.writeFileSync('Resume-parsed.txt', data.text);

          retext()
            .use(pos) // Make sure to use `retext-pos` before `retext-keywords`.
            .use(keywords)
            .process(data.text, done);

          function done(err, file) {
            if (err) {
              console.log(err);
              throw err;
            }
            file.data.keywords.forEach(function(keyword) {
              k.add(toString(keyword.matches[0].node));
            });
          }
          console.log(k);
        });
    }
};

export default JobSearcher;
