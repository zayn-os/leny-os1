const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/components/cards/TaskCard.tsx',
  'src/components/cards/RaidCard.tsx',
  'src/components/cards/SkillCard.tsx',
  'src/components/cards/HabitCard.tsx',
  'src/components/forms/TaskForm.tsx',
  'src/components/forms/HabitForm.tsx',
  'src/components/forms/parts/RaidStepEditor.tsx',
  'src/components/forms/SkillForm.tsx',
  'src/components/forms/RaidForm.tsx',
];

const oldSwitch1 = `    case Stat.STR: return <Dumbbell size={size} />;
    case Stat.INT: return <Brain size={size} />;
    case Stat.DIS: return <Zap size={size} />;
    case Stat.PCE: return <Shield size={size} />;
    case Stat.EMT: return <Heart size={size} />;
    case Stat.CAM: return <Activity size={size} />;
    case Stat.CRT: return <Palette size={size} />;`;

const oldSwitch2 = `          case Stat.STR: return <Dumbbell size={18} />;
          case Stat.INT: return <Brain size={18} />;
          case Stat.DIS: return <Zap size={18} />;
          case Stat.PCE: return <Shield size={18} />;
          case Stat.EMT: return <Heart size={18} />;
          case Stat.CAM: return <Activity size={18} />;
          case Stat.CRT: return <Palette size={18} />;`;

const oldSwitch3 = `        case Stat.STR: return <Dumbbell size={size} />;
        case Stat.INT: return <Brain size={size} />;
        case Stat.DIS: return <Zap size={size} />;
        case Stat.PCE: return <Shield size={size} />;
        case Stat.EMT: return <Heart size={size} />;
        case Stat.CAM: return <Activity size={size} />;
        case Stat.CRT: return <Palette size={size} />;`;

const newSwitch1 = `    case Stat.STR: return <Dumbbell size={size} />;
    case Stat.INT: return <Brain size={size} />;
    case Stat.DIS: return <Zap size={size} />;
    case Stat.HEA: return <Heart size={size} />;
    case Stat.CRT: return <Palette size={size} />;
    case Stat.SPR: return <Flame size={size} />;
    case Stat.REL: return <Users size={size} />;
    case Stat.FIN: return <Coins size={size} />;`;

const newSwitch2 = `          case Stat.STR: return <Dumbbell size={18} />;
          case Stat.INT: return <Brain size={18} />;
          case Stat.DIS: return <Zap size={18} />;
          case Stat.HEA: return <Heart size={18} />;
          case Stat.CRT: return <Palette size={18} />;
          case Stat.SPR: return <Flame size={18} />;
          case Stat.REL: return <Users size={18} />;
          case Stat.FIN: return <Coins size={18} />;`;

const newSwitch3 = `        case Stat.STR: return <Dumbbell size={size} />;
        case Stat.INT: return <Brain size={size} />;
        case Stat.DIS: return <Zap size={size} />;
        case Stat.HEA: return <Heart size={size} />;
        case Stat.CRT: return <Palette size={size} />;
        case Stat.SPR: return <Flame size={size} />;
        case Stat.REL: return <Users size={size} />;
        case Stat.FIN: return <Coins size={size} />;`;

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add new imports if not present
    if (!content.includes('Coins')) {
      content = content.replace(/import \{([^}]+)\} from 'lucide-react';/, (match, p1) => {
        return \`import { \${p1.trim()}, Coins, Users, Flame } from 'lucide-react';\`;
      });
    }

    content = content.replace(oldSwitch1, newSwitch1);
    content = content.replace(oldSwitch2, newSwitch2);
    content = content.replace(oldSwitch3, newSwitch3);
    
    fs.writeFileSync(filePath, content);
    console.log('Updated', file);
  } else {
    console.log('Not found', file);
  }
});
