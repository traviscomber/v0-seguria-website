'use client'

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle2, ImagePlus, LayoutTemplate, Loader2, Save, ShieldCheck, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from