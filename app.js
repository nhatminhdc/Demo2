/* ============================
   Xe Điện Cute — app.js
   - Lead form: Supabase + Make
   - Modal: Phone + Zalo
   - Mobile menu + Scroll reveal
   ============================ */
(function () {
  "use strict";

  // ---------- Config ----------
  const SUPABASE_URL = "https://pmolygxmckenlisqszyb.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtb2x5Z3htY2tlbmxpc3FzenliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1NjM2OTEsImV4cCI6MjA5NDEzOTY5MX0.9YLqyQONWDrKqVHcqRUPyvFSCvl8xNJb6Lomf1Qm44U";
  const SUPABASE_TABLE = "leads";
  const MAKE_WEBHOOK_URL =
    "https://hook.eu2.make.com/zpm8uxe8lvwte684ihl1i6uni8lkwqw6";

  // ---------- Helpers ----------
  function $(sel, root) {
    return (root || document).querySelector(sel);
  }
  function $$(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }
  function normalize(str) {
    if (!str) return "";
    return String(str)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/\s+/g, " ")
      .trim();
  }
  function classifyCategory(note) {
    const text = normalize(note);
    if (!text) return "Warm";
    const HOT = [
      "mua",
      "chot",
      "dat coc",
      "len don",
      "ship",
      "tra gop",
      "gop",
      "khi nao co xe",
      "co san",
      "uu dai",
      "khuyen mai",
      "giam gia",
      "gia bao nhieu",
      "bao nhieu tien",
      "hom nay",
      "ngay mai"
    ];
    const COLD = ["xem cho vui", "tham khao", "khong mua", "qua mien phi", "voucher", "test"];
    if (HOT.some((k) => text.includes(k))) return "Hot";
    if (COLD.some((k) => text.includes(k))) return "Cold";
    return "Warm";
  }

  // ---------- Modal logic ----------
  function setupModals() {
    const backdrops = $$(".modal-backdrop");

    function open(id) {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }
    function close(el) {
      el.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    $$("[data-modal-open]").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        open(btn.getAttribute("data-modal-open"));
      })
    );

    backdrops.forEach((bd) => {
      bd.addEventListener("click", (e) => {
        if (e.target === bd) close(bd);
      });
      $$(".close", bd).forEach((b) => b.addEventListener("click", () => close(bd)));
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      backdrops.forEach((bd) => {
        if (bd.classList.contains("is-open")) close(bd);
      });
    });
  }

  // ---------- Mobile menu ----------
  function setupMobileMenu() {
    const toggle = $(".menu-toggle");
    const nav = $(".main-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", () => nav.classList.toggle("is-open"));
    $$("a", nav).forEach((a) => a.addEventListener("click", () => nav.classList.remove("is-open")));
  }

  // ---------- Scroll reveal ----------
  function setupReveal() {
    const els = $$(".fade-up");
    if (!("IntersectionObserver" in window) || els.length === 0) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "-40px 0px" }
    );
    els.forEach((el) => io.observe(el));
  }

  // ---------- Form ----------
  function setupLeadForm() {
    const form = $("#lead-form");
    if (!form) return;
    const submitBtn = $("#submit-btn", form);
    const formMessage = $("#form-message", form);

    function setMessage(msg, type) {
      formMessage.textContent = msg;
      formMessage.className = "form-message";
      if (type) formMessage.classList.add("form-message-" + type);
    }

    async function sendMake(payload) {
      const body = new URLSearchParams();
      Object.entries(payload).forEach(([k, v]) => body.append(k, v == null ? "" : String(v)));
      await fetch(MAKE_WEBHOOK_URL, { method: "POST", mode: "no-cors", body });
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const note = String(fd.get("note") || "").trim();
      const category = classifyCategory(note);
      const supabasePayload = {
        name: String(fd.get("name") || "").trim(),
        Phone: String(fd.get("phone") || "").trim(),
        email: String(fd.get("email") || "").trim(),
        note,
        category
      };

      if (!supabasePayload.name || !supabasePayload.Phone) {
        setMessage("Vui lòng nhập đủ Họ tên và Số điện thoại.", "error");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Đang gửi...";
      setMessage("Đang gửi thông tin, vui lòng đợi...", "loading");

      try {
        const supaRes = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            Prefer: "return=representation"
          },
          body: JSON.stringify(supabasePayload)
        });
        if (!supaRes.ok) {
          let detail = "Không thể lưu dữ liệu vào Supabase.";
          const errText = await supaRes.text();
          if (errText) {
            try {
              const j = JSON.parse(errText);
              detail = j.message || j.error || j.details || detail;
            } catch (_) {
              detail = errText;
            }
          }
          throw new Error(detail);
        }

        await sendMake({
          name: supabasePayload.name,
          phone: supabasePayload.Phone,
          email: supabasePayload.email,
          note: supabasePayload.note,
          category: supabasePayload.category,
          source: "landing_page_xe_dien_cute",
          submittedAt: new Date().toISOString()
        });

        form.reset();
        setMessage("Gửi thành công! Đội ngũ Xe Điện Cute sẽ gọi lại trong vài phút.", "success");
      } catch (err) {
        console.error("Submit lead failed:", err);
        setMessage("Gửi thất bại: " + err.message, "error");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Gửi thông tin ngay";
      }
    });
  }

  // ---------- Year ----------
  function setYear() {
    const y = $("#year");
    if (y) y.textContent = new Date().getFullYear();
  }

  // ---------- Init ----------
  function init() {
    setupModals();
    setupMobileMenu();
    setupReveal();
    setupLeadForm();
    setYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
