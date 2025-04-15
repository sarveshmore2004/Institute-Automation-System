// utils/gradeUtils.js
const gradePointMap = {
  AA: 10,
  AS: 10,
  AB: 9,
  BB: 8,
  BC: 7,
  CC: 6,
  CD: 5,
  DD: 4,
  FA: 0,
  FP: 0,
  FD: 0,
  "N/A": 0,
};

function calculateSpiCpi(grades) {
  const semesterMap = {};
  grades.forEach((course) => {
    if (!semesterMap[course.semester]) semesterMap[course.semester] = [];
    semesterMap[course.semester].push(course);
  });

  const spiCpi = [];
  let totalCredits = 0;
  let totalWeightedScore = 0;

  Object.keys(semesterMap)
    .sort()
    .forEach((sem) => {
      const courses = semesterMap[sem];
      let semCredits = 0;
      let semScore = 0;

      courses.forEach((course) => {
        const gp = gradePointMap[course.grade] ?? 0;
        const cr = parseInt(course.credits);
        semCredits += cr;
        semScore += cr * gp;
      });

      const spi = semScore / semCredits;
      totalCredits += semCredits;
      totalWeightedScore += semScore;

      spiCpi.push({
        semester: sem,
        spi: spi.toFixed(2),
        cpi: (totalWeightedScore / totalCredits).toFixed(2),
      });
    });

  return spiCpi;
}
module.exports = { calculateSpiCpi };
