document.querySelectorAll(".problem_generator").forEach(generator => {
    const updateInputsByCombo = () => {
      const values = Array.from(generator.querySelectorAll(".option_group")).map(group => {
        return group.querySelector("input[type='radio']:checked")?.value || "";
      });
  
      if (values.includes("")) return; // 하나라도 선택 안 됐으면 중단
  
      const comboKey = values.join("-"); // 예: "1-1"
      const match = generator.querySelector(`.combo_map [data-combo="${comboKey}"]`);
  
      const textInput = generator.querySelector(".text_input");
      const formulaInput = generator.querySelector(".formula_input");
  
      if (match) {
        if (textInput) textInput.setAttribute("data-answer-single", match.dataset.text || "");
        if (formulaInput) formulaInput.setAttribute("data-answer-single", match.dataset.formula || "");
      } else {
        // 조합이 없을 경우 비우기
        if (textInput) textInput.setAttribute("data-answer-single", "");
        if (formulaInput) formulaInput.setAttribute("data-answer-single", "");
      }
    };
  
    generator.addEventListener("change", updateInputsByCombo);
    updateInputsByCombo(); // 초기 실행
  });
  