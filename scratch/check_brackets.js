import fs from 'fs';

const content = fs.readFileSync('d:/tutor_website/tutoradmin---tutoring-platform-super-admin/src/components/TutorsManagement.tsx', 'utf8');

function checkBrackets(str) {
    let stack = [];
    let lines = str.split('\n');
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        for (let j = 0; j < line.length; j++) {
            let char = line[j];
            if (char === '{') stack.push({ char, line: i + 1 });
            else if (char === '}') {
                if (stack.length === 0) {
                    console.log(`Extra } at line ${i + 1}`);
                } else {
                    stack.pop();
                }
            }
        }
    }
    while (stack.length > 0) {
        let last = stack.pop();
        console.log(`Unclosed { at line ${last.line}`);
    }
}

checkBrackets(content);
