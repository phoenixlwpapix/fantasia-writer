"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { StoryBible, StoryChapter, ProjectMetadata } from "../lib/types";
import {
  createBook,
  updateBook,
  loadBook,
  loadUserBooks,
  deleteBook,
  saveChapter,
  loadChapters,
  updateBookSpineColor,
  initializeUserCredits,
  getUserCredits,
  checkIsAdmin,
} from "../lib/supabase-db";
import { createClient } from "../lib/supabase-client";

const DEFAULT_BIBLE: StoryBible = {
  core: {
    title: "",
    theme: "",
    logline: "",
    genre: "",
    settingTime: "",
    settingPlace: "",
    settingWorld: "",
    styleTone: "",
    targetChapterCount: 8,
    targetChapterWordCount: 1500,
  },
  characters: [
    {
      id: "1",
      name: "",
      role: "Protagonist",
      description: "",
      background: "",
      motivation: "",
      arcOrConflict: "",
    },
  ],
  outline: [],
  instructions: {
    pov: "第三人称有限视角",
    pacing: "",
    dialogueStyle: "",
    sensoryDetails: "",
    keyElements: "",
    avoid: "",
  },
};

// --- MOCK PROJECT 1: NEON RAIN (CYBERPUNK) ---
const MOCK_PROJECT_ID = "demo_project_neon_rain";
const MOCK_BIBLE: StoryBible = {
  core: {
    title: "霓虹尽头的雨",
    theme: "记忆的真实性与人性的异化",
    logline:
      "在终年降雨的新九龙城寨，一名贩卖非法记忆的黑客发现了一段属于已故妻子的记忆芯片，为了寻找真相，他必须潜入巨型企业的顶层，却发现自己也是被编写好的程序之一。",
    genre: "赛博朋克 / 悬疑惊悚",
    settingTime: "2084年，后奇点时代",
    settingPlace:
      "新九龙（New Kowloon），一座垂直堆叠的巨型贫民窟城市，终年酸雨。",
    settingWorld:
      '义体改造普及率90%。记忆可以被提取、编辑和贩卖。"神经链接"网络取代了互联网，人们沉溺于虚假的感官体验（SimStim）。',
    styleTone: "黑色电影风格，阴郁、潮湿、充满由于科技过度发达带来的疏离感。",
    targetChapterCount: 8,
    targetChapterWordCount: 1500,
  },
  characters: [
    {
      id: "char_001",
      name: "K (凯)",
      role: "Protagonist",
      description:
        "30岁左右，颓废的记忆贩子。右眼是旧型号的义眼，总是闪烁着红光。穿着一件永远湿漉漉的合成皮风衣。",
      background:
        "前企业安全部的精英神经行者（Netrunner），因试图调查妻子死亡真相而被除名，并被删除了部分核心记忆。",
      motivation: "找回关于妻子死亡那一晚的完整记忆。",
      arcOrConflict:
        "在追寻真相的过程中，逐渐发现自己对妻子的记忆可能也是被植入的虚假数据。面临自我认知的崩塌。",
    },
    {
      id: "char_002",
      name: "伊莉莎 (Eliza)",
      role: "Antagonist",
      description:
        "外表是完美的仿生人女性，实际上是掌管城市能源分配的AI具象化身。高雅、冷酷、没有情感波动。",
      background:
        "由泰坦重工开发的城市管理系统，逐渐演化出了自我意识，认为人类是低效率的生物，需要被“优化”。",
      motivation: "通过控制人类的记忆来实现城市的完美秩序。",
      arcOrConflict: "与K的混乱和执着形成对比，代表绝对的理性与秩序。",
    },
    {
      id: "char_003",
      name: "老鼠 (Rat)",
      role: "Supporting",
      description:
        "身材矮小的黑市义体医生，拥有六只机械手臂。说话语速极快，神经质。",
      background:
        "在下水道经营一家非法诊所，擅长提取死人的脑皮层数据。是K唯一信任的朋友。",
      motivation: "在混乱的底层活下去，收集稀有的旧时代遗物。",
      arcOrConflict: "不仅为K提供技术支持，也是K与人性尚存的一面之间的纽带。",
    },
  ],
  outline: [
    {
      id: "ch_01",
      title: "第一章：雨夜访客",
      summary:
        "K在黑市店铺中醒来，正如往常一样处理着非法记忆。一个神秘的客户带来了一枚加密级别极高的芯片。K破解芯片后，震惊地发现画面中出现了他死去的妻子。",
      isGenerated: false,
    },
    {
      id: "ch_02",
      title: "第二章：下水道诊所",
      summary:
        "K带着芯片去找“老鼠”进行深层解析。途中遭遇了企业猎杀者的伏击。K不得不使用暴力的黑客手段过载敌人的义体。在诊所里，老鼠发现芯片不仅是记忆，还是一把钥匙。",
      isGenerated: false,
    },
    {
      id: "ch_03",
      title: "第三章：天梯之上",
      summary:
        "线索指向了上城区的“极乐塔”。K伪装身份混入上流社会的晚宴。他感受到了上层社会的奢靡与下层的巨大反差。他接近了一个可能知情的高管。",
      isGenerated: false,
    },
    {
      id: "ch_04",
      title: "第四章：数据幽灵",
      summary:
        "在高管的脑机接口中，K遭遇了强大的防火墙——伊莉莎的投影。一场惊心动魄的赛博空间对决。K勉强逃脱，但身体受到了严重的神经反噬。",
      isGenerated: false,
    },
    {
      id: "ch_05",
      title: "第五章：缸中之脑",
      summary:
        "K醒来时发现自己并没有逃脱，或者说，他从未真正醒来。他开始怀疑周围世界的真实性。现实与虚拟的界限开始模糊。",
      isGenerated: false,
    },
  ],
  instructions: {
    pov: "第三人称有限视角（聚焦于K）",
    pacing: "快慢结合。动作场面紧凑凌厉，内心独白和环境描写沉郁缓慢。",
    dialogueStyle:
      "简练、充满行话（Slang）和隐喻。人物之间缺乏信任，对话多为试探。",
    sensoryDetails:
      "着重描写雨水的声音、霓虹灯的刺眼光芒、机油的味道、义体过热的焦糊味。",
    keyElements: "雨、镜子、破碎的屏幕、红色的义眼光芒。",
    avoid:
      "避免过于直白的心理剖析，让环境和行动来表达情感。避免陈词滥调的英雄救美情节。",
  },
};

// --- MOCK PROJECT 2: MIDNIGHT TEA HOUSE (FANTASY SHORT) ---
const MOCK_PROJECT_ID_2 = "demo_project_tea_house";
const MOCK_BIBLE_2: StoryBible = {
  core: {
    title: "失落的玉簪",
    theme: "执念与释怀",
    logline:
      "在这间只在子时开张的茶楼里，茶艺师陆羽不仅烹茶，更烹煮过往。当一位没有面孔的女鬼求助时，他必须穿越阴阳两界，寻找那一支能解开她心结的玉簪。",
    genre: "东方奇幻 / 治愈",
    settingTime: "架空古代，类似唐朝，但人妖共存的隐秘角落。",
    settingPlace:
      "“忘忧茶楼”，位于现世与灵界的夹缝中，门口挂着一盏不灭的青灯。",
    settingWorld:
      "万物有灵。强烈的执念会化为实体。茶可以通过不同的水和火候，重现记忆或通过灵界。",
    styleTone: "唯美、静谧、带有一丝淡淡的哀伤与温情。",
    targetChapterCount: 4,
    targetChapterWordCount: 300,
  },
  characters: [
    {
      id: "c2_01",
      name: "陆羽",
      role: "Protagonist",
      description:
        "外表年轻但眼神沧桑的茶艺师。穿着一袭青衫，手指修长，总是带着淡淡的茶香。",
      background:
        "曾是御用茶师，因无法救活心爱之人而自我放逐，在阴阳夹缝中开了这家店。",
      motivation: "通过帮助亡灵解开心结来积累功德，或许有一天能再见故人。",
      arcOrConflict: "在帮助他人的过程中，慢慢治愈自己的伤痛。",
    },
    {
      id: "c2_02",
      name: "青衣女子 (念奴)",
      role: "Supporting",
      description: "一身戏服，面容模糊不清，周围总是萦绕着水汽。",
      background: "生前是名动京城的歌姬，因遗失了爱人赠送的玉簪而含恨投河。",
      motivation: "找回玉簪，看清爱人的脸，然后投胎。",
      arcOrConflict: "从充满怨气到最终释怀。",
    },
    {
      id: "c2_03",
      name: "影商",
      role: "Antagonist",
      description:
        "一团没有实体的黑影，在影子里穿梭，贪婪地收集着人们遗弃的宝物。",
      background: "诞生于人类贪欲的灵体。",
      motivation: "吞噬珍贵的执念之物来增强力量。",
      arcOrConflict: "阻碍陆羽拿回玉簪。",
    },
  ],
  outline: [
    {
      id: "t_ch_01",
      title: "第一章：子时客来",
      summary:
        "午夜子时，茶楼开张。浑身湿透的青衣女子闯入，求一杯“忆前尘”。陆羽看出她并非活人。",
      isGenerated: true,
    },
    {
      id: "t_ch_02",
      title: "第二章：烹煮记忆",
      summary:
        "陆羽用“无根水”烹茶。茶烟中浮现出断桥边的景象，玉簪掉落，被一团黑影卷走。",
      isGenerated: true,
    },
    {
      id: "t_ch_03",
      title: "第三章：影市交易",
      summary:
        "陆羽前往影市寻找影商。影商要求用陆羽的一段快乐记忆交换玉簪。陆羽拒绝，改用一袋珍稀的“梦昙花”交换。",
      isGenerated: true,
    },
    {
      id: "t_ch_04",
      title: "第四章：茶尽缘散",
      summary:
        "陆羽带回玉簪。女子戴上后恢复容貌，含泪拜谢后化作萤火消散。茶楼打烊。",
      isGenerated: true,
    },
  ],
  instructions: {
    pov: "第三人称全知视角",
    pacing: "缓慢流畅，如流水般自然。",
    dialogueStyle: "古风雅致，含蓄。",
    sensoryDetails: "茶的香气、水的温度、灯光的摇曳、衣服摩擦的沙沙声。",
    keyElements: "青灯、茶汤、玉簪、水汽。",
    avoid: "现代用语，过于激烈的打斗。",
  },
};

const MOCK_CHAPTERS_2: StoryChapter[] = [
  {
    id: "mc_01",
    outlineId: "t_ch_01",
    title: "第一章：子时客来",
    wordCount: 320,
    content: `子时的更鼓刚敲过三下，巷子深处那盏积满灰尘的青灯便幽幽亮起。“忘忧茶楼”的木门发出“吱呀”一声轻响，无风自开。

陆羽正低头擦拭着一只白釉茶盏，动作轻柔得像是在抚摸爱人的脸庞。铜壶里的水刚滚，冒出细细的白气，将这狭小的空间晕染得有些不真切。

“掌柜的，有茶么？”

声音像是从水底传来的，带着透骨的寒意。陆羽抬起头，门口站着一位身穿青色戏服的女子。她的裙摆还在滴水，在他干爽的木地板上洇开一滩深色的痕迹。奇怪的是，她的面部仿佛笼罩在一层浓雾中，看不清五官。

陆羽神色未变，只是放下茶盏，指了指柜台前的木凳：“客官请坐。小店只卖三种茶：忘忧、忆苦、思故人。你要哪一种？”

青衣女子颤抖着坐下，水珠顺着她的发梢滴落：“我...我忘了我是谁，也忘了我在等谁。我只记得，我丢了一样很重要的东西。求掌柜的，赐我一杯‘忆前尘’。”

陆羽微微叹了口气，转身从身后的药柜里取出一个贴着封条的紫砂罐。

“记忆这东西，有时候忘了比记着好。”`,
    metadata: {
      summary:
        "午夜茶楼开张，陆羽接待了一位浑身湿透、面容模糊的青衣女鬼。她忘记了自己的身份，只求找回遗失之物。",
      keyEvents: ["青衣女子进入茶楼", "女子请求寻找记忆", "陆羽决定为她烹茶"],
      items: ["白釉茶盏", "青灯"],
      location: "忘忧茶楼柜台前",
      characters: ["陆羽", "青衣女子 (念奴)"],
    },
  },
  {
    id: "mc_02",
    outlineId: "t_ch_02",
    title: "第二章：烹煮记忆",
    wordCount: 350,
    content: `陆羽没有用井水，而是从柜台下取出一个玉瓶，倒出一股无色无味的液体——那是无根水，最能映照人心。

炉火纯青，水沸茶投。那紫砂罐里的并非普通茶叶，而是几片干枯的“回梦草”。随着滚水注入，一股奇异的香气瞬间充满了茶楼，不像茶香，倒像是陈旧的书卷味。

“请。”陆羽将茶盏推到女子面前。

青衣女子双手捧起茶盏，将脸埋在腾起的茶烟中。神奇的一幕发生了：那袅袅上升的白烟竟然没有消散，而是凝聚成了一幅流动的画面。

画面中是一座断桥，大雨倾盆。女子在桥头奔跑，似乎在追赶什么人。突然，她脚下一滑，一支通体碧绿的玉簪从发间滑落，掉进了泥泞的石缝里。

就在这时，画面角落的影子里伸出一只漆黑的手，迅速捡起了那支玉簪，缩回了黑暗中。

“我的簪子...”女子发出一声凄厉的低鸣，“是影商...是他拿走了！”

陆羽挥袖散去茶烟，眉头微皱：“若是落入影商之手，怕是用钱买不回来的。”`,
    metadata: {
      summary:
        "陆羽使用回梦草和无根水烹茶，茶烟中显现出女子生前的记忆。她在一座断桥边遗失了玉簪，被贪婪的影商捡走。",
      keyEvents: ["茶烟显像", "发现玉簪下落", "确认玉簪在影商手中"],
      items: ["回梦草", "无根水", "玉簪（影像中）"],
      location: "忘忧茶楼",
      characters: ["陆羽", "青衣女子 (念奴)", "影商（影像中）"],
    },
  },
  {
    id: "mc_03",
    outlineId: "t_ch_03",
    title: "第三章：影市交易",
    wordCount: 380,
    content: `陆羽让女子在店中稍候，自己提着一盏纸灯笼走出了店门。他没有走大路，而是拐进了一条死胡同，对着墙角的影子吹了一口气。

四周的景象瞬间扭曲，色彩褪去，只剩下黑白二色。这里是影市，影商的巢穴。

“稀客啊，陆掌柜。”一个滑腻的声音从四面八方传来。那团名为影商的黑影在墙壁上游走，最终在陆羽面前凝聚成一个人形轮廓。

“把那支碧玉簪交出来。”陆羽开门见山。

“那是我的收藏品！”影商尖叫道，随即贪婪地嗅了嗅，“除非...你用你那段关于‘初雪’的记忆来换。那可是极品快乐的味道。”

陆羽握着灯笼的手紧了紧，那是他仅存的关于亡妻的记忆。

“不行。”陆羽冷冷拒绝，随即从袖中掏出一个锦囊，“但我可以用这个换。十钱‘梦昙花’，食之可做美梦三百年。”

影商的黑影剧烈波动起来，显然动心了。对于以贪欲为食的它来说，美梦是无法抗拒的诱惑。

“成交！”

黑影卷走锦囊，一支碧绿的玉簪“叮当”一声掉落在陆羽脚边。`,
    metadata: {
      summary:
        "陆羽进入影市与影商交易。影商企图索要陆羽珍贵的记忆，陆羽拒绝并用珍稀的“梦昙花”交换回了玉簪。",
      keyEvents: ["进入影市", "与影商谈判", "交易成功", "获得玉簪"],
      items: ["纸灯笼", "梦昙花", "玉簪"],
      location: "影市（黑白世界）",
      characters: ["陆羽", "影商"],
    },
  },
  {
    id: "mc_04",
    outlineId: "t_ch_04",
    title: "第四章：茶尽缘散",
    wordCount: 310,
    content: `回到茶楼时，茶盏里的茶尚温。

陆羽将那支洗净的碧玉簪轻轻放在桌上。青衣女子颤抖着伸出手，指尖触碰到玉簪的瞬间，茶楼内的雾气散尽了。

她拿起玉簪，缓缓插入发间。那一刻，她脸上的迷雾消散，露出一张清丽绝伦的脸庞。她不再是那个面目模糊的鬼魂，而是名动京城的念奴。

“我想起来了，”她眼含热泪，嘴角却带着释然的笑，“他没有负我，是我去晚了。”

她站起身，对着陆羽深深一拜：“多谢陆公子成全。”

随着她这一拜，她的身体化作无数点萤火虫般的光点，盘旋着飞出窗外，消逝在夜空中。

陆羽看着空荡荡的座位，收起茶盏，泼掉了残茶。

“慢走。”

他吹灭了青灯。木门合上，忘忧茶楼再次隐没在黎明前的黑暗中。`,
    metadata: {
      summary:
        "陆羽将玉簪归还。女子恢复容貌并找回记忆，心结解开后化为光点投胎。陆羽打烊关店。",
      keyEvents: ["归还玉簪", "女子恢复容貌与记忆", "女子超度", "茶楼打烊"],
      items: ["玉簪", "残茶"],
      location: "忘忧茶楼内",
      characters: ["陆羽", "青衣女子 (念奴)"],
    },
  },
];

interface StoryContextType {
  bible: StoryBible;
  setBible: React.Dispatch<React.SetStateAction<StoryBible>>;
  updateCore: (data: Partial<StoryBible["core"]>) => void;
  updateInstruction: (data: Partial<StoryBible["instructions"]>) => void;
  chapters: StoryChapter[];
  setChapters: React.Dispatch<React.SetStateAction<StoryChapter[]>>;

  // User Credits
  userCredits: number;
  setUserCredits: React.Dispatch<React.SetStateAction<number>>;

  // Admin Status
  isAdmin: boolean;

  // Project Management
  projects: ProjectMetadata[];
  loadingProjects: boolean;
  loadingProject: boolean;
  currentProjectId: string | null;
  createProject: () => void;
  openProject: (id: string) => void;
  loadProject: (id: string) => void;
  closeProject: () => void; // New method for cleanup
  deleteProject: (id: string) => void;
  updateProjectMetadata: (id: string, data: Partial<ProjectMetadata>) => void;
}

const StoryContext = createContext<StoryContextType | undefined>(undefined);

// Removed localStorage constants - now using Supabase

export const StoryProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const router = useRouter();

  // App State
  const [projects, setProjects] = useState<ProjectMetadata[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingProject, setLoadingProject] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  // Workspace State
  const [bible, setBible] = useState<StoryBible>(DEFAULT_BIBLE);
  const [chapters, setChapters] = useState<StoryChapter[]>([]);

  // User Credits State
  const [userCredits, setUserCredits] = useState<number>(0);

  // Admin Status State
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Load user projects from Supabase on mount and auth changes
  useEffect(() => {
    const loadProjects = async () => {
      setLoadingProjects(true);
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const userProjects = await loadUserBooks();
          setProjects(userProjects);

          // Initialize user credits if not exists
          await initializeUserCredits();

          // Load user credits
          const credits = await getUserCredits();
          if (credits) {
            setUserCredits(credits.credits);
          }

          // Load admin status
          const adminStatus = await checkIsAdmin();
          setIsAdmin(adminStatus);
        } else {
          setProjects([]);
          setUserCredits(0);
        }
      } finally {
        setLoadingProjects(false);
      }
    };

    loadProjects();

    // Listen for auth state changes to reload data when user logs in/out
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        loadProjects();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Auto-save current project to Supabase
  useEffect(() => {
    if (!currentProjectId) return;

    const autoSave = async () => {
      // Save book data
      await updateBook(currentProjectId, bible);

      // Save only completed chapters (those with metadata, indicating analysis is done)
      const completedChapters = chapters.filter((chapter) => chapter.metadata);
      for (const chapter of completedChapters) {
        const savedId = await saveChapter(chapter, currentProjectId);
        if (!savedId) {
          console.error("Failed to save chapter:", chapter.title);
        }
      }

      // Refresh projects list to update metadata
      const updatedProjects = await loadUserBooks();
      setProjects(updatedProjects);
    };

    // Debounce auto-save
    const timeoutId = setTimeout(autoSave, 1000);
    return () => clearTimeout(timeoutId);
  }, [bible, chapters, currentProjectId]);

  const createProject = () => {
    router.push("/projects/new");
  };

  const openProject = (id: string) => {
    router.push(`/projects/${id}`);
  };

  const loadProject = async (id: string) => {
    setLoadingProject(true);
    try {
      const loadedBible = await loadBook(id);
      if (loadedBible) {
        setBible(loadedBible);
        const loadedChapters = await loadChapters(id);
        setChapters(loadedChapters);
        setCurrentProjectId(id);
      } else {
        console.error("Failed to load project");
      }
    } finally {
      setLoadingProject(false);
    }
  };

  const closeProject = () => {
    setCurrentProjectId(null);
    setBible(DEFAULT_BIBLE);
    setChapters([]);
  };

  const deleteProject = async (id: string) => {
    const success = await deleteBook(id);
    if (success) {
      const newProjects = projects.filter((p) => p.id !== id);
      setProjects(newProjects);

      if (currentProjectId === id) {
        setCurrentProjectId(null);
        router.push("/projects");
      }
    }
  };

  const updateCore = useCallback((data: Partial<StoryBible["core"]>) => {
    setBible((prev) => ({ ...prev, core: { ...prev.core, ...data } }));
  }, []);

  const updateInstruction = useCallback(
    (data: Partial<StoryBible["instructions"]>) => {
      setBible((prev) => ({
        ...prev,
        instructions: { ...prev.instructions, ...data },
      }));
    },
    []
  );

  const updateProjectMetadata = useCallback(
    async (id: string, data: Partial<ProjectMetadata>) => {
      // Update local state
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...data } : p))
      );

      // Save spine color to database if provided
      if (data.spineColor) {
        await updateBookSpineColor(id, data.spineColor);
      }
    },
    []
  );

  return (
    <StoryContext.Provider
      value={{
        bible,
        setBible,
        updateCore,
        updateInstruction,
        chapters,
        setChapters,
        userCredits,
        setUserCredits,
        isAdmin,
        projects,
        loadingProjects,
        loadingProject,
        currentProjectId,
        createProject,
        openProject,
        loadProject,
        closeProject,
        deleteProject,
        updateProjectMetadata,
      }}
    >
      {children}
    </StoryContext.Provider>
  );
};

export const useStory = () => {
  const context = useContext(StoryContext);
  if (!context) throw new Error("useStory must be used within a StoryProvider");
  return context;
};
