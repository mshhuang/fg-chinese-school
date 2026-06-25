const fs = require('fs');
let code = fs.readFileSync('src/pages/MyLessonPlans.tsx', 'utf8');

code = code.replace(
  `          await supabase
            .from('lesson_plans')
            .update({ content_rich_text: tempUrl })
            .eq('lesson_plan_id', lessonPlanId);`,
  `          const { error } = await supabase
            .from('lesson_plans')
            .update({ content_rich_text: tempUrl })
            .eq('lesson_plan_id', lessonPlanId);
          if (error) {
             console.error(error);
             alert("Error updating lesson plan: " + error.message);
          }`
);

fs.writeFileSync('src/pages/MyLessonPlans.tsx', code);
