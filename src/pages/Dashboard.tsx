import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { gerarPDF } from "../utils/pdf";

export default function Dashboard() {
  const [totalRiscos, setTotalRiscos] = useState(0);
  const [totalEpis, setTotalEpis] = useState(0);
  const [totalChecklists, setTotalChecklists] = useState(0);
  const [totalDDS, setTotalDDS] = useState(0);
  const [totalAuditorias, setTotalAuditorias] = useState(0);

  const [dadosRiscos, setDadosRiscos] = useState<any[]>([]);

  const [riscosAltos, setRiscosAltos] = useState(0);
  const [riscosMedios, setRiscosMedios] = useState(0);
  const [riscosBaixos, setRiscosBaixos] = useState(0);
  const [episBaixos, setEpisBaixos] = useState(0);

  useEffect(() => {
    const riscos = JSON.parse(
      localStorage.getItem("riscos") || "[]"
    );

    const epis = JSON.parse(
      localStorage.getItem("epis") || "[]"
    );

    const checklists = JSON.parse(
      localStorage.getItem("checklists") || "[]"
    );

    const dds = JSON.parse(
      localStorage.getItem("dds") || "[]"
    );

    const auditorias = JSON.parse(
      localStorage.getItem("auditorias") || "[]"
    );

    setTotalRiscos(riscos.length);
    setTotalEpis(epis.length);
    setTotalChecklists(checklists.length);
    setTotalDDS(dds.length);
    setTotalAuditorias(auditorias.length);

    setRiscosAltos(
        riscos.filter(
          (r: any) => r.nivel === "Alto"
        ).length
      );
      
      setRiscosMedios(
        riscos.filter(
          (r: any) => r.nivel === "Médio"
        ).length
      );
      
      setRiscosBaixos(
        riscos.filter(
          (r: any) => r.nivel === "Baixo"
        ).length
      );
      
      setEpisBaixos(
        epis.filter(
          (e: any) => e.quantidade < 5
        ).length
      );

    const categorias: Record<string, number> = {};

    riscos.forEach((risco: any) => {
      categorias[risco.categoria] =
        (categorias[risco.categoria] || 0) + 1;
    });

    const dadosGrafico = Object.entries(categorias).map(
      ([name, value]) => ({
        name,
        value,
      })
    );

    setDadosRiscos(dadosGrafico);
  }, []);

  const cores = [
    "#ef4444",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#06b6d4",
  ];

  const acoes = [
    "Controle de riscos térmicos",
    "Redução da exposição ao ruído",
    "Monitoramento de vapores e fumaça",
    "Entrega e controle de EPIs",
    "DDS semanal obrigatório",
    "Checklists de inspeção diária",
  ];

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "1400px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <h1
          style={{
            fontSize: "42px",
            fontWeight: "800",
            color: "#0f172a",
            margin: 0,
          }}
        >
          🍳 Dashboard SafeKitchen
        </h1>

        <button
          onClick={gerarPDF}
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            padding: "12px 22px",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "15px",
          }}
        >
          📄 Gerar Relatório PDF
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
        }}
      >
        <Card
          titulo="Riscos"
          valor={String(totalRiscos)}
          cor="#ef4444"
        />

        <Card
          titulo="EPIs"
          valor={String(totalEpis)}
          cor="#3b82f6"
        />

        <Card
          titulo="Checklists"
          valor={String(totalChecklists)}
          cor="#10b981"
        />

        <Card
          titulo="DDS"
          valor={String(totalDDS)}
          cor="#8b5cf6"
        />

        <Card
          titulo="Auditorias"
          valor={String(totalAuditorias)}
          cor="#f59e0b"
        />

<Card
  titulo="Riscos Altos"
  valor={String(riscosAltos)}
  cor="#dc2626"
/>

<Card
  titulo="Riscos Médios"
  valor={String(riscosMedios)}
  cor="#f59e0b"
/>

<Card
  titulo="Riscos Baixos"
  valor={String(riscosBaixos)}
  cor="#16a34a"
/>

<Card
  titulo="EPIs Críticos"
  valor={String(episBaixos)}
  cor="#7c3aed"
/>
      </div>

      <div
        style={{
          marginTop: "30px",
          background: "#fff",
          padding: "30px",
          borderRadius: "20px",
          boxShadow:
            "0 10px 25px rgba(0,0,0,.08)",
        }}
      >
        <h2
          style={{
            color: "#0f172a",
            marginBottom: "20px",
          }}
        >
          Plano de Intervenção
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(280px,1fr))",
            gap: "15px",
          }}
        >
          {acoes.map((acao) => (
            <div
              key={acao}
              style={{
                background: "#f8fafc",
                padding: "18px",
                borderRadius: "12px",
                borderLeft:
                  "5px solid #2563eb",
                color: "#334155",
                fontWeight: "500",
              }}
            >
              ✓ {acao}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          marginTop: "30px",
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr",
          gap: "20px",
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: "25px",
            borderRadius: "20px",
            boxShadow:
              "0 10px 25px rgba(0,0,0,.08)",
          }}
        >
          <h2
            style={{
              color: "#0f172a",
            }}
          >
            📊 Distribuição dos Riscos
          </h2>

          <div
            style={{
              width: "100%",
              height: "320px",
            }}
          >
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={dadosRiscos}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                  label
                >
                  {dadosRiscos.map(
                    (_, index) => (
                      <Cell
                        key={index}
                        fill={
                          cores[
                            index %
                              cores.length
                          ]
                        }
                      />
                    )
                  )}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "25px",
            borderRadius: "20px",
            boxShadow:
              "0 10px 25px rgba(0,0,0,.08)",
          }}
        >
          <h2>📈 Indicadores SST</h2>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              marginTop: "20px",
            }}
          >
            <div
              style={{
                background: "#f8fafc",
                padding: "20px",
                borderRadius: "12px",
              }}
            >
              <h3>
                Conformidade Geral
              </h3>

              <h1
                style={{
                  color: "#10b981",
                  fontSize: "48px",
                }}
              >
                92%
              </h1>
            </div>

            <div
              style={{
                background: "#f8fafc",
                padding: "20px",
                borderRadius: "12px",
              }}
            >
              <h3>
                Total de Registros
              </h3>

              <h1
                style={{
                  color: "#2563eb",
                  fontSize: "48px",
                }}
              >
                {totalRiscos +
                  totalEpis +
                  totalChecklists +
                  totalDDS +
                  totalAuditorias}
              </h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({
  titulo,
  valor,
  cor,
}: {
  titulo: string;
  valor: string;
  cor: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        padding: "25px",
        borderRadius: "20px",
        boxShadow:
          "0 10px 25px rgba(0,0,0,.08)",
        borderLeft: `6px solid ${cor}`,
      }}
    >
      <h3
        style={{
          color: "#475569",
          marginBottom: "10px",
        }}
      >
        {titulo}
      </h3>

      <div
        style={{
          color: cor,
          fontSize: "48px",
          fontWeight: "800",
        }}
      >
        {valor}
      </div>
    </div>
  );
}