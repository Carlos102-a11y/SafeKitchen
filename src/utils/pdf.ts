import jsPDF from "jspdf";

export function gerarPDF() {
  const doc = new jsPDF();

  const riscos =
    JSON.parse(localStorage.getItem("riscos") || "[]");

  const epis =
    JSON.parse(localStorage.getItem("epis") || "[]");

  const dds =
    JSON.parse(localStorage.getItem("dds") || "[]");

  const auditorias =
    JSON.parse(localStorage.getItem("auditorias") || "[]");

  doc.setFontSize(20);
  doc.text("RELATÓRIO SAFEKITCHEN", 20, 20);

  doc.setFontSize(12);

  doc.text(
    `Data: ${new Date().toLocaleDateString()}`,
    20,
    35
  );

  doc.text(
    `Total de Riscos: ${riscos.length}`,
    20,
    50
  );

  doc.text(
    `Total de EPIs: ${epis.length}`,
    20,
    60
  );

  doc.text(
    `Total de DDS: ${dds.length}`,
    20,
    70
  );

  doc.text(
    `Total de Auditorias: ${auditorias.length}`,
    20,
    80
  );

  doc.save("relatorio-safekitchen.pdf");
}