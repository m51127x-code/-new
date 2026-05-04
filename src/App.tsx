import React, { useState, useRef, useCallback } from "react";
import {
  Settings,
  Layout,
  Monitor,
  Smartphone,
  Edit3,
  Eye,
  Package,
  Layers,
  Sparkles,
  Save,
  FileCode,
  Box,
  ArrowDown,
  ArrowUp,
  X,
  Plus,
  Palette,
  Trash2,
  List,
  Undo2,
  Calendar,
  CheckSquare,
  Square,
  Tag,
  AlertCircle,
} from "lucide-react";

// ─── 型別定義 ───
type IconName =
  | "Package"
  | "Layout"
  | "Settings"
  | "Monitor"
  | "Smartphone"
  | "Layers";

interface Step {
  id: string;
  icon: IconName;
  path: string;
  action: string;
  desc: string;
  borderColor: string;
}

interface UiConfig {
  appTitle: string;
  version: string;
  appSubtitle: string;
  sidebarTitle: string;
  reportBadge: string;
  reportTitle: string;
  reportTag: string;
  stepLabel: string;
  screenshotLabel: string;
  footerLine1: string;
  footerLine2: string;
}

interface HistoryState {
  uiConfig: UiConfig;
  steps: Step[];
  images: Record<string, string[]>;
}

interface InlineInputProps {
  value: string;
  onChange: (v: string) => void;
  isEditing: boolean;
  className?: string;
  as?: "input" | "textarea";
  placeholder?: string;
}

// ─── InlineInput：editing 時直接 controlled，不用本地 state ───
const InlineInput = ({
  value,
  onChange,
  isEditing,
  className = "",
  as = "input",
  placeholder,
}: InlineInputProps) => {
  if (!isEditing) {
    return <span className={className}>{value || placeholder}</span>;
  }
  if (as === "textarea") {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`bg-slate-100/50 border border-dashed border-slate-400 focus:bg-white focus:outline-none transition-all resize-none ${className}`}
        rows={2}
      />
    );
  }
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`bg-transparent border-b border-dashed border-slate-400 focus:bg-white/5 focus:outline-none transition-all w-full ${className}`}
    />
  );
};

const COLOR_PALETTE: Record<string, string> = {
  DEFAULT: "#71717a",
  GRAY: "#8e93a1",
  GREEN: "#96d1c9",
  ORANGE: "#f6c483",
};

const ICONS: IconName[] = [
  "Package",
  "Layout",
  "Settings",
  "Monitor",
  "Smartphone",
  "Layers",
];

const INITIAL_STEPS: Step[] = [
  {
    id: "step-1",
    icon: "Layout",
    path: "廠務模組 > 基本資料 > 〔品類資料管理〕",
    action: "建立子類別",
    desc: "於左側資料夾結構按右鍵執行『建立子類別』。",
    borderColor: COLOR_PALETTE.DEFAULT,
  },
  {
    id: "step-2",
    icon: "Settings",
    path: "廠務模組 > 基本資料 > 〔規格單位管理〕",
    action: "新增規格單位",
    desc: "新增商品所需的特定規格與子單位。",
    borderColor: COLOR_PALETTE.DEFAULT,
  },
  {
    id: "step-3",
    icon: "Monitor",
    path: "廠務模組 > 基本資料 > 〔品項資料管理〕",
    action: "建置品項基本檔",
    desc: "『品項設定』建置基本資料，並注意基本單位；『商品規格維護』確認基本單位換算、單位重與包裝型態。",
    borderColor: COLOR_PALETTE.DEFAULT,
  },
  {
    id: "step-4",
    icon: "Layers",
    path: "廠務模組 > 基本資料 > 〔產品內容管理〕",
    action: "商品規格維護",
    desc: "切換到『商品規格維護』新增規格；確認基本單位換算、單位重與包裝型態。",
    borderColor: COLOR_PALETTE.DEFAULT,
  },
];

const App = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedStepIds, setSelectedStepIds] = useState<string[]>(() =>
    INITIAL_STEPS.map((s) => s.id)
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const flowContainerRef = useRef<HTMLDivElement>(null);
  const mainScrollRef = useRef<HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uiConfig, setUiConfig] = useState<UiConfig>({
    appTitle: "SOP Flow Master",
    version: "v2.2.0",
    appSubtitle: "Process SOP Builder",
    sidebarTitle: "流程導覽清單",
    reportBadge: "SOP Assessment Report",
    reportTitle: "標準作業流程",
    reportTag: "",
    stepLabel: "STEP",
    screenshotLabel: "SCREENSHOT",
    footerLine1: "MASTER DOCUMENT",
    footerLine2: "Released 202603 • System SOP Assessment Tool",
  });

  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
  const [images, setImages] = useState<Record<string, string[]>>({});
  const [history, setHistory] = useState<HistoryState[]>([]);

  const getTodayDate = () => {
    const today = new Date();
    return `${today.getFullYear()}/${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${today.getDate().toString().padStart(2, "0")}`;
  };

  const getCurrentState = useCallback(
    (): HistoryState => ({
      uiConfig: JSON.parse(JSON.stringify(uiConfig)),
      steps: JSON.parse(JSON.stringify(steps)),
      images: JSON.parse(JSON.stringify(images)),
    }),
    [uiConfig, steps, images]
  );

  const saveToHistory = useCallback(() => {
    const newState = getCurrentState();
    setHistory((prev) => {
      if (prev.length > 0) {
        const last = prev[prev.length - 1];
        if (JSON.stringify(last) === JSON.stringify(newState)) return prev;
      }
      return [...prev.slice(-19), newState];
    });
  }, [getCurrentState]);

  const undo = () => {
    if (history.length === 0) return;
    const prevHistory = [...history];
    const lastState = prevHistory.pop()!;
    setUiConfig(lastState.uiConfig);
    setSteps(lastState.steps);
    setImages(lastState.images);
    setHistory(prevHistory);
  };

  const toggleAdminMode = () => {
    if (isAdmin) saveToHistory();
    setIsAdmin((prev) => !prev);
  };

  const updateUiConfig = (key: keyof UiConfig, value: string) => {
    setUiConfig((prev) => ({ ...prev, [key]: value }));
  };

  const updateStep = (id: string, field: keyof Step, value: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const addStep = () => {
    const newId = `step-${Date.now()}`;
    setSteps((prev) => [
      ...prev,
      {
        id: newId,
        icon: "Package" as IconName,
        path: "請輸入系統路徑",
        action: "請輸入操作標題",
        desc: "請在此輸入詳細說明，使用分號(;)來換行產生圓點列表。",
        borderColor: COLOR_PALETTE.DEFAULT,
      },
    ]);
    setSelectedStepIds((prev) => [...prev, newId]);
  };

  const removeStep = (id: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== id));
    setSelectedStepIds((prev) => prev.filter((sid) => sid !== id));
    setImages((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const moveStep = (index: number, dir: number) => {
    if (index + dir < 0 || index + dir >= steps.length) return;
    const newSteps = [...steps];
    const temp = newSteps[index];
    newSteps[index] = newSteps[index + dir];
    newSteps[index + dir] = temp;
    setSteps(newSteps);
  };

  const toggleStepSelection = (id: string) => {
    setSelectedStepIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedStepIds(steps.map((s) => s.id));
  const selectNone = () => setSelectedStepIds([]);

  const scrollToStep = (id: string) => {
    if (!selectedStepIds.includes(id)) return;
    const container = mainScrollRef.current;
    const target = document.getElementById(id);
    if (container && target) {
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const relativeTop =
        targetRect.top - containerRect.top + container.scrollTop;
      container.scrollTo({ top: relativeTop - 48, behavior: "smooth" });
    }
  };

  const renderIcon = (name: string, className = "") => {
    const props = { size: 24, className };
    switch (name) {
      case "Layout":
        return <Layout {...props} />;
      case "Settings":
        return <Settings {...props} />;
      case "Monitor":
        return <Monitor {...props} />;
      case "Smartphone":
        return <Smartphone {...props} />;
      case "Layers":
        return <Layers {...props} />;
      default:
        return <Package {...props} />;
    }
  };

  const downloadConfig = () => {
    const configData = {
      uiConfig,
      steps,
      images,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(configData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SOP-Template-${uiConfig.version}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawData = JSON.parse(event.target?.result as string);
        const data = rawData.data ? rawData.data : rawData;
        if (!data.steps || !Array.isArray(data.steps))
          throw new Error("JSON 格式不符");
        if (isAdmin) saveToHistory();
        if (data.uiConfig)
          setUiConfig((prev) => ({ ...prev, ...data.uiConfig }));
        setSteps(data.steps);
        setSelectedStepIds(data.steps.map((s: Step) => s.id));
        setImages(data.images || {});
        setHistory([]);
      } catch {
        setErrorMessage("匯入失敗：檔案格式錯誤。");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const renderDescription = (text: string) => {
    if (!text) return null;
    const parts = text.split(/[；;]/).filter((p) => p.trim() !== "");
    return (
      <div className="space-y-4">
        {parts.map((part, i) => (
          <div key={i} className="relative pl-7 block min-h-[1.75rem]">
            <div className="absolute left-0 top-[0.65em] w-1.5 h-5 bg-[#009688] rounded-full opacity-80" />
            <span className="text-[#334155] font-medium text-[15.5px] tracking-tight leading-7 block break-words whitespace-pre-wrap">
              {part.trim()}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const exportAsImage = async () => {
    setIsExporting(true);
    try {
      if (!(window as any).html2canvas) {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
        document.head.appendChild(script);
        await new Promise((resolve) => (script.onload = resolve));
      }
      const element = flowContainerRef.current!;
      const canvas = await (window as any).html2canvas(element, {
        backgroundColor: "#ffffff",
        scale: 3,
        useCORS: true,
        logging: false,
        onclone: (clonedDoc: Document) => {
          const root = clonedDoc.querySelector(
            '[data-report-root="true"]'
          ) as HTMLElement;
          if (root) {
            root.style.width = "1000px";
            root.style.padding = "60px";
            root.style.borderRadius = "0px";
            root.style.boxShadow = "none";
            root.style.margin = "0 auto";
          }
        },
      });
      const link = document.createElement("a");
      link.download = `${uiConfig.reportTitle}_Export.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();
    } catch (e) {
      console.error("Export error:", e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImageUpload = (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () =>
        setImages((prev) => ({
          ...prev,
          [id]: [...(prev[id] || []), reader.result as string],
        }));
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const visibleSteps = steps.filter((s) => selectedStepIds.includes(s.id));
  const hasTagValue = uiConfig.reportTag && uiConfig.reportTag.trim() !== "";

  return (
    <div className="flex flex-col h-screen bg-[#f1f5f9] font-['PingFang_TC','Noto_Sans_TC',serif] antialiased text-slate-800">
      {/* Error Modal */}
      {errorMessage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
              <AlertCircle size={32} />
            </div>
            <h4 className="text-xl font-black text-slate-800">發生錯誤</h4>
            <p className="text-slate-500 text-sm leading-relaxed">
              {errorMessage}
            </p>
            <button
              onClick={() => setErrorMessage(null)}
              className="w-full py-3 bg-[#33334d] text-white rounded-xl font-bold hover:bg-[#444466] transition-colors"
            >
              我知道了
            </button>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="h-16 bg-[#33334d] flex items-center justify-between px-8 shrink-0 z-30 shadow-xl border-b border-white/5">
        <div className="flex items-center gap-4 w-1/3">
          <div className="w-10 h-10 bg-gradient-to-tr from-[#8e93a1] to-[#96d1c9] rounded-xl flex items-center justify-center shadow-inner shrink-0">
            <Box size={20} className="text-white" />
          </div>
          <div className="flex flex-col w-full">
            <div className="flex items-center gap-2">
              <InlineInput
                value={uiConfig.appTitle}
                onChange={(v) => updateUiConfig("appTitle", v)}
                isEditing={isAdmin}
                className="font-bold text-base text-white tracking-tight"
              />
              <InlineInput
                value={uiConfig.version}
                onChange={(v) => updateUiConfig("version", v)}
                isEditing={isAdmin}
                className="bg-[#f6c483] text-[#33334d] text-[9px] font-black px-1.5 py-0.5 rounded-md max-w-[60px] text-center"
              />
            </div>
            <InlineInput
              value={uiConfig.appSubtitle}
              onChange={(v) => updateUiConfig("appSubtitle", v)}
              isEditing={isAdmin}
              className="text-[10px] text-[#96d1c9] font-black tracking-[0.2em] uppercase mt-1 opacity-80 block"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={undo}
              disabled={history.length === 0}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold transition-all border ${
                history.length > 0
                  ? "bg-white/10 text-white border-white/20 hover:bg-white/20"
                  : "text-white/30 border-white/10 opacity-50"
              }`}
            >
              <Undo2 size={14} /> 復原版本 ({history.length})
            </button>
          )}
          <div className="flex items-center bg-white/5 p-1 rounded-xl mr-2 border border-white/10">
            <button
              onClick={downloadConfig}
              className="px-4 py-1.5 text-[11px] font-bold text-white/70 hover:text-white transition-all text-nowrap"
            >
              <Save size={14} className="inline mr-1.5 mb-0.5 opacity-70" />{" "}
              儲存配置
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-1.5 text-[11px] font-bold text-white/70 hover:text-white transition-all text-nowrap"
            >
              <FileCode size={14} className="inline mr-1.5 mb-0.5 opacity-70" />{" "}
              讀取配置
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".json"
              onChange={importConfig}
            />
          </div>
          <button
            onClick={toggleAdminMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold transition-all border shrink-0 ${
              isAdmin
                ? "bg-[#009688] text-white border-transparent shadow-lg"
                : "bg-white/10 text-white border-white/20 hover:bg-white/20"
            }`}
          >
            {isAdmin ? <Eye size={14} /> : <Edit3 size={14} />}{" "}
            {isAdmin ? "預覽報表" : "進入編輯模式"}
          </button>
          {!isAdmin && (
            <button
              onClick={exportAsImage}
              disabled={isExporting}
              className="bg-white text-[#33334d] px-6 py-2 rounded-xl text-[11px] font-black hover:bg-[#96d1c9] transition-all shadow-xl disabled:opacity-50 shrink-0"
            >
              {isExporting ? "處理中..." : "匯出已選步驟"}
            </button>
          )}
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-white border-r border-slate-200 overflow-y-auto p-8 z-20 shadow-sm flex flex-col shrink-0">
          <div className="flex items-center justify-between mb-8 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-1 h-3 bg-[#f6c483] rounded-full"></div>
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">
                <InlineInput
                  value={uiConfig.sidebarTitle}
                  onChange={(v) => updateUiConfig("sidebarTitle", v)}
                  isEditing={isAdmin}
                  className="text-slate-400"
                />
              </h3>
            </div>
            {!isAdmin && (
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-[9px] font-black text-[#009688] hover:underline uppercase"
                >
                  全選
                </button>
                <button
                  onClick={selectNone}
                  className="text-[9px] font-black text-slate-400 hover:underline uppercase"
                >
                  清除
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pr-1">
            {isAdmin ? (
              <div className="space-y-4">
                <button
                  onClick={addStep}
                  className="w-full py-3.5 bg-slate-50 border border-slate-200 text-slate-500 hover:text-[#009688] hover:border-[#009688] hover:bg-[#009688]/5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all mb-4"
                >
                  <Plus size={16} /> 新增流程步驟
                </button>
                <div className="space-y-3">
                  {steps.map((step, index) => (
                    <div
                      key={step.id}
                      className="p-3.5 bg-white border border-slate-200 rounded-xl flex flex-col gap-3 shadow-sm group hover:border-slate-300 transition-colors relative"
                    >
                      <div className="absolute -left-2 top-4 w-4 h-4 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-400">
                        {index + 1}
                      </div>
                      <div className="flex items-center justify-between pl-2">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <div className="bg-slate-50 p-1.5 rounded-lg text-slate-400 shrink-0">
                            {renderIcon(step.icon, "w-4 h-4")}
                          </div>
                          <span className="text-xs font-bold text-slate-700 truncate">
                            {step.action || "未命名步驟"}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => moveStep(index, -1)}
                            disabled={index === 0}
                            className="p-1 text-slate-400 hover:text-[#009688] disabled:opacity-30 rounded"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            onClick={() => moveStep(index, 1)}
                            disabled={index === steps.length - 1}
                            className="p-1 text-slate-400 hover:text-[#009688] disabled:opacity-30 rounded"
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button
                            onClick={() => removeStep(step.id)}
                            className="p-1 text-slate-400 hover:text-red-500 rounded"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="pl-2">
                        <select
                          value={step.icon}
                          onChange={(e) =>
                            updateStep(step.id, "icon", e.target.value)
                          }
                          className="w-full text-[11px] bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-500 outline-none focus:border-[#009688]"
                        >
                          {ICONS.map((i) => (
                            <option key={i} value={i}>
                              {i}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 relative">
                <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-slate-100 rounded-full"></div>
                {steps.map((step) => {
                  const isSelected = selectedStepIds.includes(step.id);
                  return (
                    <div
                      key={step.id}
                      className={`relative pl-10 group cursor-pointer py-2 rounded-xl transition-all ${
                        isSelected ? "bg-slate-50/50" : "opacity-50"
                      }`}
                      onClick={() => toggleStepSelection(step.id)}
                    >
                      <div
                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center transition-colors ${
                          isSelected ? "text-[#009688]" : "text-slate-300"
                        }`}
                      >
                        {isSelected ? (
                          <CheckSquare size={20} />
                        ) : (
                          <Square size={20} />
                        )}
                      </div>
                      <div
                        className="flex flex-col min-w-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          scrollToStep(step.id);
                        }}
                      >
                        <p
                          className={`text-sm font-bold leading-tight mb-1 transition-colors ${
                            isSelected
                              ? "text-slate-600 group-hover:text-[#009688]"
                              : "text-slate-400"
                          }`}
                        >
                          {step.action || "未命名步驟"}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate w-full">
                          {step.path}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 shrink-0">
            <div className="text-[11px] font-bold tracking-widest text-slate-400 flex items-center gap-1.5 opacity-80">
              <Calendar size={13} className="text-slate-300" />
              <span className="text-slate-500">DATE: {getTodayDate()}</span>
            </div>
          </div>
        </aside>

        {/* Main Report */}
        <main
          ref={mainScrollRef}
          className="flex-1 overflow-y-auto p-12 bg-[#f8fafc] relative scroll-smooth"
        >
          <div
            className="max-w-4xl mx-auto space-y-10 bg-white rounded-[2.8rem] shadow-[0_20px_60px_-15px_rgba(51,51,77,0.08)] p-16 border border-slate-50 relative z-10"
            ref={flowContainerRef}
            data-report-root="true"
          >
            {/* Header */}
            <div className="text-center space-y-5 mb-14 flex flex-col items-center">
              <div className="inline-flex items-center justify-center gap-2 px-6 py-1.5 bg-slate-50 rounded-full text-slate-400 text-[10px] font-bold uppercase tracking-[0.4em] border border-slate-100 min-w-[200px]">
                <Sparkles size={12} className="text-[#96d1c9] shrink-0" />
                <InlineInput
                  value={uiConfig.reportBadge}
                  onChange={(v) => updateUiConfig("reportBadge", v)}
                  isEditing={isAdmin}
                  className="text-center"
                />
              </div>
              <h2 className="text-[44px] font-black text-[#33334d] tracking-tighter leading-tight w-full flex justify-center">
                <InlineInput
                  value={uiConfig.reportTitle}
                  onChange={(v) => updateUiConfig("reportTitle", v)}
                  isEditing={isAdmin}
                  className="text-center block max-w-full break-words"
                />
              </h2>

              <div className="w-full flex flex-col items-center gap-4 mt-6">
                <div className="flex justify-center gap-2 mb-2">
                  <div className="w-14 h-2.5 bg-[#8e93a1] rounded-full"></div>
                  <div className="w-14 h-2.5 bg-[#96d1c9] rounded-full"></div>
                  <div className="w-14 h-2.5 bg-[#f6c483] rounded-full"></div>
                </div>
                <div
                  className={`flex items-center justify-center w-full ${
                    hasTagValue || isAdmin ? "gap-8" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 opacity-70">
                    <Calendar
                      size={13}
                      className="text-slate-400 translate-y-[1.5px]"
                    />
                    <span className="text-[12px] font-bold text-slate-500">
                      {getTodayDate()}
                    </span>
                  </div>
                  {(isAdmin || hasTagValue) && (
                    <div className="flex items-center gap-2 opacity-70">
                      <Tag
                        size={13}
                        className="text-[#96d1c9] translate-y-[1.5px]"
                      />
                      <InlineInput
                        value={uiConfig.reportTag}
                        placeholder={isAdmin ? "Enter tag..." : ""}
                        onChange={(v) => updateUiConfig("reportTag", v)}
                        isEditing={isAdmin}
                        className="text-[12px] font-bold text-slate-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Steps Area */}
            <div className="space-y-0 relative">
              {visibleSteps.length === 0 && !isAdmin ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/30">
                  <p className="text-slate-400 font-bold text-sm tracking-widest">
                    請在左側勾選欲顯示的步驟
                  </p>
                </div>
              ) : (
                (isAdmin ? steps : visibleSteps).map((step, idx) => {
                  const stepImages = images[step.id] || [];
                  const showImageSection = isAdmin || stepImages.length > 0;
                  const currentBorderColor =
                    step.borderColor || COLOR_PALETTE.DEFAULT;
                  const originalIndex = steps.findIndex(
                    (s) => s.id === step.id
                  );
                  const displayList = isAdmin ? steps : visibleSteps;

                  return (
                    <React.Fragment key={step.id}>
                      <div
                        id={step.id}
                        className="step-container relative bg-white border rounded-[2.5rem] overflow-hidden flex flex-col shadow-[0_10px_40px_-10px_rgba(0,0,0,0.12)] transition-all duration-300"
                        style={{ borderColor: currentBorderColor }}
                      >
                        <div
                          className={`p-10 ${
                            showImageSection ? "pb-2" : "pb-10"
                          } space-y-7`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-8 w-full">
                              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 bg-[#f8fafc] text-slate-400">
                                {renderIcon(
                                  step.icon,
                                  "stroke-[2.5px] w-7 h-7"
                                )}
                              </div>
                              <div className="min-w-0 pt-0.5 flex-1 space-y-3">
                                <div className="flex items-center gap-2 min-h-[1.5rem]">
                                  {isAdmin && (
                                    <List
                                      size={10}
                                      className="text-slate-300 shrink-0"
                                    />
                                  )}
                                  <div className="relative inline-flex items-center w-fit">
                                    {!isAdmin && (
                                      <div
                                        className="absolute left-0 right-0 bg-[#f1f5f9] -z-1"
                                        style={{
                                          height: "1.2em",
                                          top: "0.5em",
                                          borderRadius: "2px",
                                        }}
                                      />
                                    )}
                                    <InlineInput
                                      value={step.path}
                                      placeholder="請輸入系統路徑"
                                      onChange={(v) =>
                                        updateStep(step.id, "path", v)
                                      }
                                      isEditing={isAdmin}
                                      className={
                                        isAdmin
                                          ? "text-[12px] font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded border border-transparent"
                                          : "relative text-[13.5px] font-bold text-slate-600 mb-1.5 inline-block px-1 leading-normal z-10"
                                      }
                                    />
                                  </div>
                                </div>
                                <div className="min-h-[2rem]">
                                  <InlineInput
                                    value={step.action}
                                    placeholder="操作標題"
                                    onChange={(v) =>
                                      updateStep(step.id, "action", v)
                                    }
                                    isEditing={isAdmin}
                                    className={
                                      isAdmin
                                        ? "w-full text-xl font-black text-[#33334d] bg-slate-50 px-4 py-2 rounded-xl border border-slate-200"
                                        : "text-[26px] font-black text-[#33334d] tracking-tight leading-tight"
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="bg-[#33334d] text-white rounded-[12px] px-6 py-2.5 text-[10px] font-black tracking-[0.25em] uppercase shrink-0 ml-4 inline-flex items-center justify-center min-w-[90px] shadow-lg gap-1">
                              <InlineInput
                                value={uiConfig.stepLabel}
                                onChange={(v) => updateUiConfig("stepLabel", v)}
                                isEditing={isAdmin}
                                className="text-white"
                              />{" "}
                              {originalIndex + 1}
                            </div>
                          </div>
                          <div className="pl-[88px] pr-6">
                            {isAdmin ? (
                              <InlineInput
                                as="textarea"
                                value={step.desc}
                                placeholder="詳細說明 (分號分隔項目)"
                                onChange={(v) => updateStep(step.id, "desc", v)}
                                isEditing={isAdmin}
                                className="w-full text-[15px] text-slate-600 bg-slate-50 p-5 rounded-2xl h-28 font-medium border border-slate-200"
                              />
                            ) : (
                              renderDescription(step.desc)
                            )}
                          </div>
                        </div>

                        {showImageSection && (
                          <div className="px-10 pb-10 space-y-12 mt-6">
                            {stepImages.map((imgSrc, imgIdx) => (
                              <div
                                key={imgIdx}
                                className="space-y-0 group/img relative"
                              >
                                <div className="flex">
                                  <div className="bg-[#009688] text-white px-6 py-2 rounded-t-xl inline-flex items-center justify-center text-[10px] font-black tracking-[0.2em] uppercase shadow-sm gap-1">
                                    <InlineInput
                                      value={uiConfig.screenshotLabel}
                                      onChange={(v) =>
                                        updateUiConfig("screenshotLabel", v)
                                      }
                                      isEditing={isAdmin}
                                      className="text-white"
                                    />{" "}
                                    {stepImages.length > 1 ? imgIdx + 1 : ""}
                                  </div>
                                </div>
                                <div
                                  className="relative rounded-2xl rounded-tl-none overflow-hidden border bg-[#f8fafc] p-1.5 shadow-xl transition-all"
                                  style={{
                                    borderColor: `${currentBorderColor}80`,
                                  }}
                                >
                                  <img
                                    src={imgSrc}
                                    className="w-full h-auto object-contain block rounded-xl shadow-inner"
                                    alt="系統截圖"
                                  />
                                  {isAdmin && (
                                    <button
                                      onClick={() => {
                                        setImages((prev) => {
                                          const currentList = [
                                            ...(prev[step.id] || []),
                                          ];
                                          currentList.splice(imgIdx, 1);
                                          return {
                                            ...prev,
                                            [step.id]: currentList,
                                          };
                                        });
                                      }}
                                      className="absolute top-6 right-6 w-10 h-10 bg-[#33334d]/90 text-white rounded-xl flex items-center justify-center hover:bg-red-500 transition-all shadow-lg"
                                    >
                                      <X size={18} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                            {isAdmin && (
                              <label className="block w-full cursor-pointer bg-slate-50 border-2 border-dashed border-slate-300 hover:border-[#009688] hover:bg-white rounded-3xl transition-all group/upload mb-4">
                                <div className="flex flex-col items-center justify-center py-10 text-slate-400 group-hover/upload:text-[#009688] transition-colors">
                                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm mb-4">
                                    <Plus size={24} />
                                  </div>
                                  <span className="text-[11px] font-black uppercase tracking-[0.3em]">
                                    上傳操作截圖
                                  </span>
                                </div>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleImageUpload(step.id, e)
                                  }
                                />
                              </label>
                            )}
                          </div>
                        )}

                        {isAdmin && (
                          <div className="bg-slate-50/80 border-t border-slate-200 px-10 py-4 flex items-center gap-5 justify-between">
                            <div className="flex items-center gap-3">
                              <Palette size={14} className="text-slate-400" />
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                邊框顏色
                              </span>
                            </div>
                            <div className="flex gap-3">
                              {Object.entries(COLOR_PALETTE).map(
                                ([key, color]) => (
                                  <button
                                    key={key}
                                    onClick={() =>
                                      updateStep(step.id, "borderColor", color)
                                    }
                                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                                      currentBorderColor === color
                                        ? "scale-125 shadow-md border-white"
                                        : "border-transparent hover:scale-110 opacity-60 hover:opacity-100"
                                    }`}
                                    style={{ backgroundColor: color }}
                                  />
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {idx < displayList.length - 1 && (
                        <div className="flex justify-center py-6">
                          <div className="relative flex flex-col items-center">
                            <div className="w-[1.5px] h-8 bg-slate-200 rounded-full"></div>
                            <div
                              className="w-11 h-11 rounded-full bg-white border flex items-center justify-center shadow-md relative z-10 my-1"
                              style={{ borderColor: currentBorderColor }}
                            >
                              <ArrowDown
                                size={20}
                                className="text-[#33334d] stroke-[2.5px]"
                              />
                            </div>
                            <div className="w-[1.5px] h-8 bg-slate-200 rounded-full"></div>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="pt-24 pb-4 text-center border-t border-slate-50">
              <div className="flex flex-col items-center gap-2 opacity-40">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#f6c483]"></div>
                  <p className="text-[10px] font-black text-slate-500 uppercase">
                    <InlineInput
                      value={uiConfig.footerLine1}
                      onChange={(v) => updateUiConfig("footerLine1", v)}
                      isEditing={isAdmin}
                    />
                  </p>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#009688]"></div>
                </div>
                <p className="text-[9px] font-bold text-slate-400 uppercase">
                  <InlineInput
                    value={uiConfig.footerLine2}
                    onChange={(v) => updateUiConfig("footerLine2", v)}
                    isEditing={isAdmin}
                  />
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
