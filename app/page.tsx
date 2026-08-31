import Image from "next/image";
import { contarInscritos } from "@/lib/db";
import { LINK_AMAZON, PRECO_EBOOK, TIRAGEM } from "@/lib/config";
import { BotaoAmazon } from "./componentes/BotaoAmazon";
import { FormReserva } from "./componentes/FormReserva";
import hero from "@/public/hero_page.jpg";
import capa from "@/public/capa_livro.png";
import autor from "@/public/foto-autor.png";

export const dynamic = "force-dynamic";

const Seta = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 4v14" />
    <path d="M6 13l6 6 6-6" />
  </svg>
);

export default async function Pagina() {
  const total = await contarInscritos();
  const restantes = total === null ? null : Math.max(0, TIRAGEM - total);

  return (
    <>
      <div className="painel">
        Departamento de Términos e Aberturas &nbsp;·&nbsp; Guichê <span className="num">08</span>
        &nbsp;·&nbsp; senha <span className="num">214</span> <span className="pisca">▮</span>
      </div>

      {/* ═══════════════ HERO ═══════════════ */}
      <div className="hero-banner">
        <Image
          src={hero}
          alt="A Cidade Inacabada — algumas cidades são feitas de concreto, outras de histórias que nunca acabam"
          priority
          sizes="100vw"
        />
      </div>

      {/* ═══════════════ FAIXA DOS OBJETOS ═══════════════ */}
      <div className="faixa">
        <div className="faixa-grid">
          <div className="objeto">
            <Image src={capa} alt="A Cidade Inacabada, edição impressa" sizes="(max-width: 860px) 80vw, 300px" />
          </div>

          <div className="destaques-bloco">
            <h2>Do que este livro é feito</h2>
            <div className="destaques">
            <div className="destaque-item">
              <div className="icone">
                <svg viewBox="0 0 24 24"><path d="M12 6.5C10.5 5 8.5 4.5 6 4.5H3v14h3c2.5 0 4.5.5 6 2 1.5-1.5 3.5-2 6-2h3v-14h-3c-2.5 0-4.5.5-6 2z" /><path d="M12 6.5v14" /></svg>
              </div>
              <div>
                <h3>Duzentos e quatorze começos</h3>
                <p>Cada curso largado, cada caderno de três páginas, cada empresa que nunca saiu do papel. Tudo foi parar em algum lugar.</p>
              </div>
            </div>

            <div className="destaque-item">
              <div className="icone">
                <svg viewBox="0 0 24 24"><path d="M12 3l2.4 5.6 6.1.5-4.6 4 1.4 5.9L12 15.8 6.7 19l1.4-5.9-4.6-4 6.1-.5z" /></svg>
              </div>
              <div>
                <h3>Humor de repartição</h3>
                <p>Uma burocracia inteira montada para cuidar do que a gente abandonou. Formulários para sentimentos, carimbos para milagres.</p>
              </div>
            </div>

            <div className="destaque-item">
              <div className="icone">
                <svg viewBox="0 0 24 24"><path d="M12 2v3" /><path d="M8.5 8h7l1.5 8a5 5 0 01-10 0z" /><path d="M12 16v6" /><path d="M9 22h6" /></svg>
              </div>
              <div>
                <h3>Para quem é bom em começar</h3>
                <p>A pergunta nunca foi como terminar as coisas. É por que a gente começa. E o livro responde sem dar lição em ninguém.</p>
              </div>
            </div>
</div>
          </div>
        </div>

        <div className="faixa-acao">
          <p className="nota">
            {LINK_AMAZON ? "Disponível na Amazon" : "Em análise na Amazon"} · ebook por {PRECO_EBOOK.replace(" ", "\u00a0")}
            <br />
            impresso em tiragem única de {TIRAGEM} exemplares
            {restantes !== null && (
              <> · {restantes > 0 ? `${restantes} ainda sem destinatário` : "lote completo"}</>
            )}
          </p>
          <div className="faixa-botoes">
            <div className="botao-marcado">
              <span className="etiqueta">Ebook <Seta /></span>
              <BotaoAmazon />
            </div>
            <div className="botao-marcado">
              <span className="etiqueta">Livro físico <Seta /></span>
              <a className="botao escuro" href="#form">Entrar na fila dos {TIRAGEM}</a>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════ SINOPSE ═══════════════ */}
      <div className="sinopse">
        <h2>Notificação de cobrança</h2>
        <div className="grid">
          <p className="pergunta">O que você faria se todos os projetos que você começou e não terminou viessem bater na sua porta?</p>
          <div className="texto">
            <p>Numa noite comum, Martim, 42 anos, ouve sete toques na campainha. Do lado de fora, um homem de terno bege segura uma prancheta e anuncia uma auditoria.</p>
            <p>Cada começo abandonado, ele explica, foi parar em algum lugar: existe uma cidade inteira construída de cursos largados, livros pela metade e empresas que nunca saíram do papel. E a cidade quer recebê-lo.</p>
            <p>Entre um herói sem pés, uma pensão que serve o jantar de anteontem e um lote apagado no fundo do Distrito 214, Martim descobre que a pergunta nunca foi como terminar as coisas. É por que a gente começa.</p>
          </div>
        </div>
      </div>

      <div className="fecho">
        <p>Uma autobiografia ficcional baseada em fatos irreais, para todo mundo que sempre foi bom em começar.</p>
      </div>

      <hr className="divisor" />

      {/* ═══════════════ OS 42 ═══════════════ */}
      <div className="secao-42">
        <div className="grid">
          <div>
            <h2>Edição impressa · tiragem única</h2>
            <div className="corpo">
              <p className="frase">Serão <em>apenas</em> quarenta e dois exemplares impressos. Um único lote, numerado à mão, sem reimpressão.</p>
              <p>O número não é aleatório. Quem leu o livro entende, e quem ainda não leu vai entender na primeira página.</p>
              <p>A lista ao lado não cobra nada e não reserva nada em definitivo. Ela só define a ordem em que o Departamento entra em contato quando os exemplares ficarem prontos.</p>
            </div>
          </div>

          <FormReserva totalInicial={total} />
        </div>
      </div>

      {/* ═══════════════ AUTOR ═══════════════ */}
      <div className="wrap">
        <section>
          <h2>Ficha do autor</h2>
          <div className="autor-grid">
            <div className="autor-foto">
              <Image src={autor} alt="Marcelinho" sizes="(max-width: 760px) 240px, 280px" />
            </div>
            <div className="corpo">
              <p>Marcelinho começou este livro do mesmo jeito que começou um curso de violão, uma empresa, três blogs e uma maquete de cidade: com entusiasmo total e nenhuma garantia de chegar ao fim. Este é, até onde se sabe, o primeiro que terminou. O que talvez explique por que ele precisou escrever um livro inteiro sobre isso.</p>
              <p>Ilustrador, designer e colecionador de inícios, vive em São José dos Campos com o Celso, a Kira e o Nero. Segue começando coisas. Algumas ele termina. As outras, agora ele sabe, ficam morando em algum lugar.</p>
              <span className="assinatura">Marcelinho</span>
            </div>
          </div>
        </section>
      </div>

      {/* ═══════════════ RODAPÉ ═══════════════ */}
      <footer>
        <div className="footer-cols">
          <div>Romance<br />164 páginas</div>
          <div>Ebook na Amazon<br />Impresso em tiragem única</div>
          <div>Acompanhe<br /><a href="https://instagram.com/versaoilustrada">@versaoilustrada</a></div>
        </div>
        A Cidade Inacabada · Marcelinho · 2026<br />
        Todo começo é protocolado automaticamente, sem custo e sem julgamento.
      </footer>
    </>
  );
}
