"use client";

import { useState } from "react";
import styles from "./page.module.css";

interface Atividade {
  nome: string;
  categoria: string;
  descricao: string;
  dica: string;
}

const TIPOS = [
  "Qualquer coisa",
  "Cultura e arte",
  "Gastronomia",
  "Esportes e natureza",
  "Festas e shows",
  "Família e crianças",
  "Turismo e passeios",
];

const CATEGORIA_CORES: Record<string, string> = {
  "Cultura": styles.tagCultura,
  "Arte": styles.tagCultura,
  "Cultura e arte": styles.tagCultura,
  "Gastronomia": styles.tagGastronomia,
  "Natureza": styles.tagNatureza,
  "Esporte": styles.tagNatureza,
  "Esportes e natureza": styles.tagNatureza,
  "Shows": styles.tagShows,
  "Festas e shows": styles.tagShows,
  "Família": styles.tagFamilia,
  "Turismo": styles.tagTurismo,
};

function getCategoriaClass(categoria: string): string {
  for (const key of Object.keys(CATEGORIA_CORES)) {
    if (categoria.toLowerCase().includes(key.toLowerCase())) {
      return CATEGORIA_CORES[key];
    }
  }
  return styles.tagDefault;
}

export default function Home() {
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [type, setType] = useState("Qualquer coisa");
  const [extras, setExtras] = useState("");
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const dateLabel = date
    ? new Date(date + "T12:00:00").toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  async function buscar() {
    if (!location || !date) {
      setError("Preencha a cidade e a data.");
      return;
    }
    setError("");
    setLoading(true);
    setSearched(true);
    setAtividades([]);

    try {
      const res = await fetch("/api/buscar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, date: dateLabel, type, extras }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao buscar");
      setAtividades(data.atividades);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao buscar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <p className={styles.eyebrow}>Powered by IA</p>
        <h1 className={styles.title}>O que fazer em<br /><em>qualquer lugar</em></h1>
        <p className={styles.desc}>
          Informe uma cidade e uma data — a IA sugere atividades personalizadas para você.
        </p>
      </div>

      <div className={styles.formCard}>
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label className={styles.label}>Cidade ou região</label>
            <input
              type="text"
              placeholder="Ex: Porto Alegre, RS"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && buscar()}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Tipo de atividade</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {TIPOS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Interesses extras <span className={styles.optional}>(opcional)</span></label>
            <input
              type="text"
              placeholder="Ex: ao ar livre, barato, histórico..."
              value={extras}
              onChange={(e) => setExtras(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && buscar()}
            />
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.btn} onClick={buscar} disabled={loading}>
          {loading ? "Buscando..." : "Descobrir atividades →"}
        </button>
      </div>

      {searched && (
        <div className={styles.results}>
          {loading && (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>Buscando atividades em <strong>{location}</strong>...</p>
            </div>
          )}

          {!loading && atividades.length > 0 && (
            <>
              <p className={styles.resultsHeader}>
                {atividades.length} sugestões para <strong>{location}</strong> — {dateLabel}
              </p>
              <div className={styles.cards}>
                {atividades.map((a, i) => (
                  <div key={i} className={styles.card} style={{ animationDelay: `${i * 80}ms` }}>
                    <span className={`${styles.tag} ${getCategoriaClass(a.categoria)}`}>
                      {a.categoria}
                    </span>
                    <h2 className={styles.cardTitle}>{a.nome}</h2>
                    <p className={styles.cardDesc}>{a.descricao}</p>
                    {a.dica && (
                      <p className={styles.cardDica}>
                        <span className={styles.dicaIcon}>✦</span> {a.dica}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <footer className={styles.footer}>
        Feito com Next.js + Claude API
      </footer>
    </main>
  );
}
