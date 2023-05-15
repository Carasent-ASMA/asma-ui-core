import xe from "react";
import { Badge as eo, Tooltip as to, Button as ro, styled as Ce, FormControlLabel as no, FormHelperText as oo, FormLabel as io, Input as so, InputLabel as ao, Switch as co, FormControl as uo, TextField as lo, Dialog as fo, DialogActions as po, DialogContent as mo, DialogTitle as ho, Alert as yo, AlertTitle as go, Snackbar as vo, Select as bo, MenuItem as Eo } from "@mui/material";
import So from "@emotion/styled";
import "@emotion/react";
var lt = {}, xo = {
  get exports() {
    return lt;
  },
  set exports(e) {
    lt = e;
  }
}, Ke = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Er;
function To() {
  if (Er)
    return Ke;
  Er = 1;
  var e = xe, t = Symbol.for("react.element"), r = Symbol.for("react.fragment"), n = Object.prototype.hasOwnProperty, o = e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, i = { key: !0, ref: !0, __self: !0, __source: !0 };
  function s(c, u, l) {
    var f, p = {}, d = null, S = null;
    l !== void 0 && (d = "" + l), u.key !== void 0 && (d = "" + u.key), u.ref !== void 0 && (S = u.ref);
    for (f in u)
      n.call(u, f) && !i.hasOwnProperty(f) && (p[f] = u[f]);
    if (c && c.defaultProps)
      for (f in u = c.defaultProps, u)
        p[f] === void 0 && (p[f] = u[f]);
    return { $$typeof: t, type: c, key: d, ref: S, props: p, _owner: o.current };
  }
  return Ke.Fragment = r, Ke.jsx = s, Ke.jsxs = s, Ke;
}
var Ge = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Sr;
function _o() {
  return Sr || (Sr = 1, process.env.NODE_ENV !== "production" && function() {
    var e = xe, t = Symbol.for("react.element"), r = Symbol.for("react.portal"), n = Symbol.for("react.fragment"), o = Symbol.for("react.strict_mode"), i = Symbol.for("react.profiler"), s = Symbol.for("react.provider"), c = Symbol.for("react.context"), u = Symbol.for("react.forward_ref"), l = Symbol.for("react.suspense"), f = Symbol.for("react.suspense_list"), p = Symbol.for("react.memo"), d = Symbol.for("react.lazy"), S = Symbol.for("react.offscreen"), x = Symbol.iterator, h = "@@iterator";
    function m(a) {
      if (a === null || typeof a != "object")
        return null;
      var y = x && a[x] || a[h];
      return typeof y == "function" ? y : null;
    }
    var O = e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function _(a) {
      {
        for (var y = arguments.length, E = new Array(y > 1 ? y - 1 : 0), C = 1; C < y; C++)
          E[C - 1] = arguments[C];
        R("error", a, E);
      }
    }
    function R(a, y, E) {
      {
        var C = O.ReactDebugCurrentFrame, z = C.getStackAddendum();
        z !== "" && (y += "%s", E = E.concat([z]));
        var X = E.map(function(B) {
          return String(B);
        });
        X.unshift("Warning: " + y), Function.prototype.apply.call(console[a], console, X);
      }
    }
    var U = !1, g = !1, I = !1, ee = !1, ce = !1, M;
    M = Symbol.for("react.module.reference");
    function J(a) {
      return !!(typeof a == "string" || typeof a == "function" || a === n || a === i || ce || a === o || a === l || a === f || ee || a === S || U || g || I || typeof a == "object" && a !== null && (a.$$typeof === d || a.$$typeof === p || a.$$typeof === s || a.$$typeof === c || a.$$typeof === u || // This needs to include all possible module reference object
      // types supported by any Flight configuration anywhere since
      // we don't know which Flight build this will end up being used
      // with.
      a.$$typeof === M || a.getModuleId !== void 0));
    }
    function ue(a, y, E) {
      var C = a.displayName;
      if (C)
        return C;
      var z = y.displayName || y.name || "";
      return z !== "" ? E + "(" + z + ")" : E;
    }
    function pe(a) {
      return a.displayName || "Context";
    }
    function ae(a) {
      if (a == null)
        return null;
      if (typeof a.tag == "number" && _("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof a == "function")
        return a.displayName || a.name || null;
      if (typeof a == "string")
        return a;
      switch (a) {
        case n:
          return "Fragment";
        case r:
          return "Portal";
        case i:
          return "Profiler";
        case o:
          return "StrictMode";
        case l:
          return "Suspense";
        case f:
          return "SuspenseList";
      }
      if (typeof a == "object")
        switch (a.$$typeof) {
          case c:
            var y = a;
            return pe(y) + ".Consumer";
          case s:
            var E = a;
            return pe(E._context) + ".Provider";
          case u:
            return ue(a, a.render, "ForwardRef");
          case p:
            var C = a.displayName || null;
            return C !== null ? C : ae(a.type) || "Memo";
          case d: {
            var z = a, X = z._payload, B = z._init;
            try {
              return ae(B(X));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    var oe = Object.assign, ge = 0, le, he, be, _e, v, T, j;
    function k() {
    }
    k.__reactDisabledLog = !0;
    function P() {
      {
        if (ge === 0) {
          le = console.log, he = console.info, be = console.warn, _e = console.error, v = console.group, T = console.groupCollapsed, j = console.groupEnd;
          var a = {
            configurable: !0,
            enumerable: !0,
            value: k,
            writable: !0
          };
          Object.defineProperties(console, {
            info: a,
            log: a,
            warn: a,
            error: a,
            group: a,
            groupCollapsed: a,
            groupEnd: a
          });
        }
        ge++;
      }
    }
    function F() {
      {
        if (ge--, ge === 0) {
          var a = {
            configurable: !0,
            enumerable: !0,
            writable: !0
          };
          Object.defineProperties(console, {
            log: oe({}, a, {
              value: le
            }),
            info: oe({}, a, {
              value: he
            }),
            warn: oe({}, a, {
              value: be
            }),
            error: oe({}, a, {
              value: _e
            }),
            group: oe({}, a, {
              value: v
            }),
            groupCollapsed: oe({}, a, {
              value: T
            }),
            groupEnd: oe({}, a, {
              value: j
            })
          });
        }
        ge < 0 && _("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    var $ = O.ReactCurrentDispatcher, A;
    function D(a, y, E) {
      {
        if (A === void 0)
          try {
            throw Error();
          } catch (z) {
            var C = z.stack.trim().match(/\n( *(at )?)/);
            A = C && C[1] || "";
          }
        return `
` + A + a;
      }
    }
    var W = !1, N;
    {
      var se = typeof WeakMap == "function" ? WeakMap : Map;
      N = new se();
    }
    function b(a, y) {
      if (!a || W)
        return "";
      {
        var E = N.get(a);
        if (E !== void 0)
          return E;
      }
      var C;
      W = !0;
      var z = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var X;
      X = $.current, $.current = null, P();
      try {
        if (y) {
          var B = function() {
            throw Error();
          };
          if (Object.defineProperty(B.prototype, "props", {
            set: function() {
              throw Error();
            }
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(B, []);
            } catch (Oe) {
              C = Oe;
            }
            Reflect.construct(a, [], B);
          } else {
            try {
              B.call();
            } catch (Oe) {
              C = Oe;
            }
            a.call(B.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (Oe) {
            C = Oe;
          }
          a();
        }
      } catch (Oe) {
        if (Oe && C && typeof Oe.stack == "string") {
          for (var L = Oe.stack.split(`
`), fe = C.stack.split(`
`), ne = L.length - 1, ie = fe.length - 1; ne >= 1 && ie >= 0 && L[ne] !== fe[ie]; )
            ie--;
          for (; ne >= 1 && ie >= 0; ne--, ie--)
            if (L[ne] !== fe[ie]) {
              if (ne !== 1 || ie !== 1)
                do
                  if (ne--, ie--, ie < 0 || L[ne] !== fe[ie]) {
                    var ye = `
` + L[ne].replace(" at new ", " at ");
                    return a.displayName && ye.includes("<anonymous>") && (ye = ye.replace("<anonymous>", a.displayName)), typeof a == "function" && N.set(a, ye), ye;
                  }
                while (ne >= 1 && ie >= 0);
              break;
            }
        }
      } finally {
        W = !1, $.current = X, F(), Error.prepareStackTrace = z;
      }
      var je = a ? a.displayName || a.name : "", br = je ? D(je) : "";
      return typeof a == "function" && N.set(a, br), br;
    }
    function de(a, y, E) {
      return b(a, !1);
    }
    function w(a) {
      var y = a.prototype;
      return !!(y && y.isReactComponent);
    }
    function ve(a, y, E) {
      if (a == null)
        return "";
      if (typeof a == "function")
        return b(a, w(a));
      if (typeof a == "string")
        return D(a);
      switch (a) {
        case l:
          return D("Suspense");
        case f:
          return D("SuspenseList");
      }
      if (typeof a == "object")
        switch (a.$$typeof) {
          case u:
            return de(a.render);
          case p:
            return ve(a.type, y, E);
          case d: {
            var C = a, z = C._payload, X = C._init;
            try {
              return ve(X(z), y, E);
            } catch {
            }
          }
        }
      return "";
    }
    var we = Object.prototype.hasOwnProperty, Ve = {}, cr = O.ReactDebugCurrentFrame;
    function it(a) {
      if (a) {
        var y = a._owner, E = ve(a.type, a._source, y ? y.type : null);
        cr.setExtraStackFrame(E);
      } else
        cr.setExtraStackFrame(null);
    }
    function jn(a, y, E, C, z) {
      {
        var X = Function.call.bind(we);
        for (var B in a)
          if (X(a, B)) {
            var L = void 0;
            try {
              if (typeof a[B] != "function") {
                var fe = Error((C || "React class") + ": " + E + " type `" + B + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof a[B] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw fe.name = "Invariant Violation", fe;
              }
              L = a[B](y, B, C, E, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (ne) {
              L = ne;
            }
            L && !(L instanceof Error) && (it(z), _("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", C || "React class", E, B, typeof L), it(null)), L instanceof Error && !(L.message in Ve) && (Ve[L.message] = !0, it(z), _("Failed %s type: %s", E, L.message), it(null));
          }
      }
    }
    var Mn = Array.isArray;
    function wt(a) {
      return Mn(a);
    }
    function Dn(a) {
      {
        var y = typeof Symbol == "function" && Symbol.toStringTag, E = y && a[Symbol.toStringTag] || a.constructor.name || "Object";
        return E;
      }
    }
    function Nn(a) {
      try {
        return ur(a), !1;
      } catch {
        return !0;
      }
    }
    function ur(a) {
      return "" + a;
    }
    function lr(a) {
      if (Nn(a))
        return _("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", Dn(a)), ur(a);
    }
    var qe = O.ReactCurrentOwner, Fn = {
      key: !0,
      ref: !0,
      __self: !0,
      __source: !0
    }, fr, dr, Ot;
    Ot = {};
    function Ln(a) {
      if (we.call(a, "ref")) {
        var y = Object.getOwnPropertyDescriptor(a, "ref").get;
        if (y && y.isReactWarning)
          return !1;
      }
      return a.ref !== void 0;
    }
    function Wn(a) {
      if (we.call(a, "key")) {
        var y = Object.getOwnPropertyDescriptor(a, "key").get;
        if (y && y.isReactWarning)
          return !1;
      }
      return a.key !== void 0;
    }
    function Bn(a, y) {
      if (typeof a.ref == "string" && qe.current && y && qe.current.stateNode !== y) {
        var E = ae(qe.current.type);
        Ot[E] || (_('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', ae(qe.current.type), a.ref), Ot[E] = !0);
      }
    }
    function Un(a, y) {
      {
        var E = function() {
          fr || (fr = !0, _("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", y));
        };
        E.isReactWarning = !0, Object.defineProperty(a, "key", {
          get: E,
          configurable: !0
        });
      }
    }
    function zn(a, y) {
      {
        var E = function() {
          dr || (dr = !0, _("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", y));
        };
        E.isReactWarning = !0, Object.defineProperty(a, "ref", {
          get: E,
          configurable: !0
        });
      }
    }
    var Yn = function(a, y, E, C, z, X, B) {
      var L = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: t,
        // Built-in properties that belong on the element
        type: a,
        key: y,
        ref: E,
        props: B,
        // Record the component responsible for creating this element.
        _owner: X
      };
      return L._store = {}, Object.defineProperty(L._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: !1
      }), Object.defineProperty(L, "_self", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: C
      }), Object.defineProperty(L, "_source", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: z
      }), Object.freeze && (Object.freeze(L.props), Object.freeze(L)), L;
    };
    function Vn(a, y, E, C, z) {
      {
        var X, B = {}, L = null, fe = null;
        E !== void 0 && (lr(E), L = "" + E), Wn(y) && (lr(y.key), L = "" + y.key), Ln(y) && (fe = y.ref, Bn(y, z));
        for (X in y)
          we.call(y, X) && !Fn.hasOwnProperty(X) && (B[X] = y[X]);
        if (a && a.defaultProps) {
          var ne = a.defaultProps;
          for (X in ne)
            B[X] === void 0 && (B[X] = ne[X]);
        }
        if (L || fe) {
          var ie = typeof a == "function" ? a.displayName || a.name || "Unknown" : a;
          L && Un(B, ie), fe && zn(B, ie);
        }
        return Yn(a, L, fe, z, C, qe.current, B);
      }
    }
    var Rt = O.ReactCurrentOwner, pr = O.ReactDebugCurrentFrame;
    function ke(a) {
      if (a) {
        var y = a._owner, E = ve(a.type, a._source, y ? y.type : null);
        pr.setExtraStackFrame(E);
      } else
        pr.setExtraStackFrame(null);
    }
    var Ct;
    Ct = !1;
    function Pt(a) {
      return typeof a == "object" && a !== null && a.$$typeof === t;
    }
    function mr() {
      {
        if (Rt.current) {
          var a = ae(Rt.current.type);
          if (a)
            return `

Check the render method of \`` + a + "`.";
        }
        return "";
      }
    }
    function qn(a) {
      {
        if (a !== void 0) {
          var y = a.fileName.replace(/^.*[\\\/]/, ""), E = a.lineNumber;
          return `

Check your code at ` + y + ":" + E + ".";
        }
        return "";
      }
    }
    var hr = {};
    function Kn(a) {
      {
        var y = mr();
        if (!y) {
          var E = typeof a == "string" ? a : a.displayName || a.name;
          E && (y = `

Check the top-level render call using <` + E + ">.");
        }
        return y;
      }
    }
    function yr(a, y) {
      {
        if (!a._store || a._store.validated || a.key != null)
          return;
        a._store.validated = !0;
        var E = Kn(y);
        if (hr[E])
          return;
        hr[E] = !0;
        var C = "";
        a && a._owner && a._owner !== Rt.current && (C = " It was passed a child from " + ae(a._owner.type) + "."), ke(a), _('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', E, C), ke(null);
      }
    }
    function gr(a, y) {
      {
        if (typeof a != "object")
          return;
        if (wt(a))
          for (var E = 0; E < a.length; E++) {
            var C = a[E];
            Pt(C) && yr(C, y);
          }
        else if (Pt(a))
          a._store && (a._store.validated = !0);
        else if (a) {
          var z = m(a);
          if (typeof z == "function" && z !== a.entries)
            for (var X = z.call(a), B; !(B = X.next()).done; )
              Pt(B.value) && yr(B.value, y);
        }
      }
    }
    function Gn(a) {
      {
        var y = a.type;
        if (y == null || typeof y == "string")
          return;
        var E;
        if (typeof y == "function")
          E = y.propTypes;
        else if (typeof y == "object" && (y.$$typeof === u || // Note: Memo only checks outer props here.
        // Inner props are checked in the reconciler.
        y.$$typeof === p))
          E = y.propTypes;
        else
          return;
        if (E) {
          var C = ae(y);
          jn(E, a.props, "prop", C, a);
        } else if (y.PropTypes !== void 0 && !Ct) {
          Ct = !0;
          var z = ae(y);
          _("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", z || "Unknown");
        }
        typeof y.getDefaultProps == "function" && !y.getDefaultProps.isReactClassApproved && _("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
      }
    }
    function Hn(a) {
      {
        for (var y = Object.keys(a.props), E = 0; E < y.length; E++) {
          var C = y[E];
          if (C !== "children" && C !== "key") {
            ke(a), _("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", C), ke(null);
            break;
          }
        }
        a.ref !== null && (ke(a), _("Invalid attribute `ref` supplied to `React.Fragment`."), ke(null));
      }
    }
    function vr(a, y, E, C, z, X) {
      {
        var B = J(a);
        if (!B) {
          var L = "";
          (a === void 0 || typeof a == "object" && a !== null && Object.keys(a).length === 0) && (L += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var fe = qn(z);
          fe ? L += fe : L += mr();
          var ne;
          a === null ? ne = "null" : wt(a) ? ne = "array" : a !== void 0 && a.$$typeof === t ? (ne = "<" + (ae(a.type) || "Unknown") + " />", L = " Did you accidentally export a JSX literal instead of a component?") : ne = typeof a, _("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", ne, L);
        }
        var ie = Vn(a, y, E, z, X);
        if (ie == null)
          return ie;
        if (B) {
          var ye = y.children;
          if (ye !== void 0)
            if (C)
              if (wt(ye)) {
                for (var je = 0; je < ye.length; je++)
                  gr(ye[je], a);
                Object.freeze && Object.freeze(ye);
              } else
                _("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
            else
              gr(ye, a);
        }
        return a === n ? Hn(ie) : Gn(ie), ie;
      }
    }
    function Jn(a, y, E) {
      return vr(a, y, E, !0);
    }
    function Xn(a, y, E) {
      return vr(a, y, E, !1);
    }
    var Qn = Xn, Zn = Jn;
    Ge.Fragment = n, Ge.jsx = Qn, Ge.jsxs = Zn;
  }()), Ge;
}
(function(e) {
  process.env.NODE_ENV === "production" ? e.exports = To() : e.exports = _o();
})(xo);
const H = lt.jsx, on = lt.jsxs;
function Z() {
  return Z = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, Z.apply(this, arguments);
}
function We(e) {
  return e !== null && typeof e == "object" && e.constructor === Object;
}
function sn(e) {
  if (!We(e))
    return e;
  const t = {};
  return Object.keys(e).forEach((r) => {
    t[r] = sn(e[r]);
  }), t;
}
function Re(e, t, r = {
  clone: !0
}) {
  const n = r.clone ? Z({}, e) : e;
  return We(e) && We(t) && Object.keys(t).forEach((o) => {
    o !== "__proto__" && (We(t[o]) && o in e && We(e[o]) ? n[o] = Re(e[o], t[o], r) : r.clone ? n[o] = We(t[o]) ? sn(t[o]) : t[o] : n[o] = t[o]);
  }), n;
}
var Ie = {}, xr = {
  get exports() {
    return Ie;
  },
  set exports(e) {
    Ie = e;
  }
}, ft = {}, wo = {
  get exports() {
    return ft;
  },
  set exports(e) {
    ft = e;
  }
}, Y = {};
/** @license React v16.13.1
 * react-is.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Tr;
function Oo() {
  if (Tr)
    return Y;
  Tr = 1;
  var e = typeof Symbol == "function" && Symbol.for, t = e ? Symbol.for("react.element") : 60103, r = e ? Symbol.for("react.portal") : 60106, n = e ? Symbol.for("react.fragment") : 60107, o = e ? Symbol.for("react.strict_mode") : 60108, i = e ? Symbol.for("react.profiler") : 60114, s = e ? Symbol.for("react.provider") : 60109, c = e ? Symbol.for("react.context") : 60110, u = e ? Symbol.for("react.async_mode") : 60111, l = e ? Symbol.for("react.concurrent_mode") : 60111, f = e ? Symbol.for("react.forward_ref") : 60112, p = e ? Symbol.for("react.suspense") : 60113, d = e ? Symbol.for("react.suspense_list") : 60120, S = e ? Symbol.for("react.memo") : 60115, x = e ? Symbol.for("react.lazy") : 60116, h = e ? Symbol.for("react.block") : 60121, m = e ? Symbol.for("react.fundamental") : 60117, O = e ? Symbol.for("react.responder") : 60118, _ = e ? Symbol.for("react.scope") : 60119;
  function R(g) {
    if (typeof g == "object" && g !== null) {
      var I = g.$$typeof;
      switch (I) {
        case t:
          switch (g = g.type, g) {
            case u:
            case l:
            case n:
            case i:
            case o:
            case p:
              return g;
            default:
              switch (g = g && g.$$typeof, g) {
                case c:
                case f:
                case x:
                case S:
                case s:
                  return g;
                default:
                  return I;
              }
          }
        case r:
          return I;
      }
    }
  }
  function U(g) {
    return R(g) === l;
  }
  return Y.AsyncMode = u, Y.ConcurrentMode = l, Y.ContextConsumer = c, Y.ContextProvider = s, Y.Element = t, Y.ForwardRef = f, Y.Fragment = n, Y.Lazy = x, Y.Memo = S, Y.Portal = r, Y.Profiler = i, Y.StrictMode = o, Y.Suspense = p, Y.isAsyncMode = function(g) {
    return U(g) || R(g) === u;
  }, Y.isConcurrentMode = U, Y.isContextConsumer = function(g) {
    return R(g) === c;
  }, Y.isContextProvider = function(g) {
    return R(g) === s;
  }, Y.isElement = function(g) {
    return typeof g == "object" && g !== null && g.$$typeof === t;
  }, Y.isForwardRef = function(g) {
    return R(g) === f;
  }, Y.isFragment = function(g) {
    return R(g) === n;
  }, Y.isLazy = function(g) {
    return R(g) === x;
  }, Y.isMemo = function(g) {
    return R(g) === S;
  }, Y.isPortal = function(g) {
    return R(g) === r;
  }, Y.isProfiler = function(g) {
    return R(g) === i;
  }, Y.isStrictMode = function(g) {
    return R(g) === o;
  }, Y.isSuspense = function(g) {
    return R(g) === p;
  }, Y.isValidElementType = function(g) {
    return typeof g == "string" || typeof g == "function" || g === n || g === l || g === i || g === o || g === p || g === d || typeof g == "object" && g !== null && (g.$$typeof === x || g.$$typeof === S || g.$$typeof === s || g.$$typeof === c || g.$$typeof === f || g.$$typeof === m || g.$$typeof === O || g.$$typeof === _ || g.$$typeof === h);
  }, Y.typeOf = R, Y;
}
var V = {};
/** @license React v16.13.1
 * react-is.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var _r;
function Ro() {
  return _r || (_r = 1, process.env.NODE_ENV !== "production" && function() {
    var e = typeof Symbol == "function" && Symbol.for, t = e ? Symbol.for("react.element") : 60103, r = e ? Symbol.for("react.portal") : 60106, n = e ? Symbol.for("react.fragment") : 60107, o = e ? Symbol.for("react.strict_mode") : 60108, i = e ? Symbol.for("react.profiler") : 60114, s = e ? Symbol.for("react.provider") : 60109, c = e ? Symbol.for("react.context") : 60110, u = e ? Symbol.for("react.async_mode") : 60111, l = e ? Symbol.for("react.concurrent_mode") : 60111, f = e ? Symbol.for("react.forward_ref") : 60112, p = e ? Symbol.for("react.suspense") : 60113, d = e ? Symbol.for("react.suspense_list") : 60120, S = e ? Symbol.for("react.memo") : 60115, x = e ? Symbol.for("react.lazy") : 60116, h = e ? Symbol.for("react.block") : 60121, m = e ? Symbol.for("react.fundamental") : 60117, O = e ? Symbol.for("react.responder") : 60118, _ = e ? Symbol.for("react.scope") : 60119;
    function R(b) {
      return typeof b == "string" || typeof b == "function" || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
      b === n || b === l || b === i || b === o || b === p || b === d || typeof b == "object" && b !== null && (b.$$typeof === x || b.$$typeof === S || b.$$typeof === s || b.$$typeof === c || b.$$typeof === f || b.$$typeof === m || b.$$typeof === O || b.$$typeof === _ || b.$$typeof === h);
    }
    function U(b) {
      if (typeof b == "object" && b !== null) {
        var de = b.$$typeof;
        switch (de) {
          case t:
            var w = b.type;
            switch (w) {
              case u:
              case l:
              case n:
              case i:
              case o:
              case p:
                return w;
              default:
                var ve = w && w.$$typeof;
                switch (ve) {
                  case c:
                  case f:
                  case x:
                  case S:
                  case s:
                    return ve;
                  default:
                    return de;
                }
            }
          case r:
            return de;
        }
      }
    }
    var g = u, I = l, ee = c, ce = s, M = t, J = f, ue = n, pe = x, ae = S, oe = r, ge = i, le = o, he = p, be = !1;
    function _e(b) {
      return be || (be = !0, console.warn("The ReactIs.isAsyncMode() alias has been deprecated, and will be removed in React 17+. Update your code to use ReactIs.isConcurrentMode() instead. It has the exact same API.")), v(b) || U(b) === u;
    }
    function v(b) {
      return U(b) === l;
    }
    function T(b) {
      return U(b) === c;
    }
    function j(b) {
      return U(b) === s;
    }
    function k(b) {
      return typeof b == "object" && b !== null && b.$$typeof === t;
    }
    function P(b) {
      return U(b) === f;
    }
    function F(b) {
      return U(b) === n;
    }
    function $(b) {
      return U(b) === x;
    }
    function A(b) {
      return U(b) === S;
    }
    function D(b) {
      return U(b) === r;
    }
    function W(b) {
      return U(b) === i;
    }
    function N(b) {
      return U(b) === o;
    }
    function se(b) {
      return U(b) === p;
    }
    V.AsyncMode = g, V.ConcurrentMode = I, V.ContextConsumer = ee, V.ContextProvider = ce, V.Element = M, V.ForwardRef = J, V.Fragment = ue, V.Lazy = pe, V.Memo = ae, V.Portal = oe, V.Profiler = ge, V.StrictMode = le, V.Suspense = he, V.isAsyncMode = _e, V.isConcurrentMode = v, V.isContextConsumer = T, V.isContextProvider = j, V.isElement = k, V.isForwardRef = P, V.isFragment = F, V.isLazy = $, V.isMemo = A, V.isPortal = D, V.isProfiler = W, V.isStrictMode = N, V.isSuspense = se, V.isValidElementType = R, V.typeOf = U;
  }()), V;
}
var wr;
function an() {
  return wr || (wr = 1, function(e) {
    process.env.NODE_ENV === "production" ? e.exports = Oo() : e.exports = Ro();
  }(wo)), ft;
}
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/
var $t, Or;
function Co() {
  if (Or)
    return $t;
  Or = 1;
  var e = Object.getOwnPropertySymbols, t = Object.prototype.hasOwnProperty, r = Object.prototype.propertyIsEnumerable;
  function n(i) {
    if (i == null)
      throw new TypeError("Object.assign cannot be called with null or undefined");
    return Object(i);
  }
  function o() {
    try {
      if (!Object.assign)
        return !1;
      var i = new String("abc");
      if (i[5] = "de", Object.getOwnPropertyNames(i)[0] === "5")
        return !1;
      for (var s = {}, c = 0; c < 10; c++)
        s["_" + String.fromCharCode(c)] = c;
      var u = Object.getOwnPropertyNames(s).map(function(f) {
        return s[f];
      });
      if (u.join("") !== "0123456789")
        return !1;
      var l = {};
      return "abcdefghijklmnopqrst".split("").forEach(function(f) {
        l[f] = f;
      }), Object.keys(Object.assign({}, l)).join("") === "abcdefghijklmnopqrst";
    } catch {
      return !1;
    }
  }
  return $t = o() ? Object.assign : function(i, s) {
    for (var c, u = n(i), l, f = 1; f < arguments.length; f++) {
      c = Object(arguments[f]);
      for (var p in c)
        t.call(c, p) && (u[p] = c[p]);
      if (e) {
        l = e(c);
        for (var d = 0; d < l.length; d++)
          r.call(c, l[d]) && (u[l[d]] = c[l[d]]);
      }
    }
    return u;
  }, $t;
}
var It, Rr;
function Kt() {
  if (Rr)
    return It;
  Rr = 1;
  var e = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
  return It = e, It;
}
var At, Cr;
function cn() {
  return Cr || (Cr = 1, At = Function.call.bind(Object.prototype.hasOwnProperty)), At;
}
var kt, Pr;
function Po() {
  if (Pr)
    return kt;
  Pr = 1;
  var e = function() {
  };
  if (process.env.NODE_ENV !== "production") {
    var t = Kt(), r = {}, n = cn();
    e = function(i) {
      var s = "Warning: " + i;
      typeof console < "u" && console.error(s);
      try {
        throw new Error(s);
      } catch {
      }
    };
  }
  function o(i, s, c, u, l) {
    if (process.env.NODE_ENV !== "production") {
      for (var f in i)
        if (n(i, f)) {
          var p;
          try {
            if (typeof i[f] != "function") {
              var d = Error(
                (u || "React class") + ": " + c + " type `" + f + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof i[f] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`."
              );
              throw d.name = "Invariant Violation", d;
            }
            p = i[f](s, f, u, c, null, t);
          } catch (x) {
            p = x;
          }
          if (p && !(p instanceof Error) && e(
            (u || "React class") + ": type specification of " + c + " `" + f + "` is invalid; the type checker function must return `null` or an `Error` but returned a " + typeof p + ". You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument)."
          ), p instanceof Error && !(p.message in r)) {
            r[p.message] = !0;
            var S = l ? l() : "";
            e(
              "Failed " + c + " type: " + p.message + (S ?? "")
            );
          }
        }
    }
  }
  return o.resetWarningCache = function() {
    process.env.NODE_ENV !== "production" && (r = {});
  }, kt = o, kt;
}
var jt, $r;
function $o() {
  if ($r)
    return jt;
  $r = 1;
  var e = an(), t = Co(), r = Kt(), n = cn(), o = Po(), i = function() {
  };
  process.env.NODE_ENV !== "production" && (i = function(c) {
    var u = "Warning: " + c;
    typeof console < "u" && console.error(u);
    try {
      throw new Error(u);
    } catch {
    }
  });
  function s() {
    return null;
  }
  return jt = function(c, u) {
    var l = typeof Symbol == "function" && Symbol.iterator, f = "@@iterator";
    function p(v) {
      var T = v && (l && v[l] || v[f]);
      if (typeof T == "function")
        return T;
    }
    var d = "<<anonymous>>", S = {
      array: O("array"),
      bigint: O("bigint"),
      bool: O("boolean"),
      func: O("function"),
      number: O("number"),
      object: O("object"),
      string: O("string"),
      symbol: O("symbol"),
      any: _(),
      arrayOf: R,
      element: U(),
      elementType: g(),
      instanceOf: I,
      node: J(),
      objectOf: ce,
      oneOf: ee,
      oneOfType: M,
      shape: pe,
      exact: ae
    };
    function x(v, T) {
      return v === T ? v !== 0 || 1 / v === 1 / T : v !== v && T !== T;
    }
    function h(v, T) {
      this.message = v, this.data = T && typeof T == "object" ? T : {}, this.stack = "";
    }
    h.prototype = Error.prototype;
    function m(v) {
      if (process.env.NODE_ENV !== "production")
        var T = {}, j = 0;
      function k(F, $, A, D, W, N, se) {
        if (D = D || d, N = N || A, se !== r) {
          if (u) {
            var b = new Error(
              "Calling PropTypes validators directly is not supported by the `prop-types` package. Use `PropTypes.checkPropTypes()` to call them. Read more at http://fb.me/use-check-prop-types"
            );
            throw b.name = "Invariant Violation", b;
          } else if (process.env.NODE_ENV !== "production" && typeof console < "u") {
            var de = D + ":" + A;
            !T[de] && // Avoid spamming the console because they are often not actionable except for lib authors
            j < 3 && (i(
              "You are manually calling a React.PropTypes validation function for the `" + N + "` prop on `" + D + "`. This is deprecated and will throw in the standalone `prop-types` package. You may be seeing this warning due to a third-party PropTypes library. See https://fb.me/react-warning-dont-call-proptypes for details."
            ), T[de] = !0, j++);
          }
        }
        return $[A] == null ? F ? $[A] === null ? new h("The " + W + " `" + N + "` is marked as required " + ("in `" + D + "`, but its value is `null`.")) : new h("The " + W + " `" + N + "` is marked as required in " + ("`" + D + "`, but its value is `undefined`.")) : null : v($, A, D, W, N);
      }
      var P = k.bind(null, !1);
      return P.isRequired = k.bind(null, !0), P;
    }
    function O(v) {
      function T(j, k, P, F, $, A) {
        var D = j[k], W = le(D);
        if (W !== v) {
          var N = he(D);
          return new h(
            "Invalid " + F + " `" + $ + "` of type " + ("`" + N + "` supplied to `" + P + "`, expected ") + ("`" + v + "`."),
            { expectedType: v }
          );
        }
        return null;
      }
      return m(T);
    }
    function _() {
      return m(s);
    }
    function R(v) {
      function T(j, k, P, F, $) {
        if (typeof v != "function")
          return new h("Property `" + $ + "` of component `" + P + "` has invalid PropType notation inside arrayOf.");
        var A = j[k];
        if (!Array.isArray(A)) {
          var D = le(A);
          return new h("Invalid " + F + " `" + $ + "` of type " + ("`" + D + "` supplied to `" + P + "`, expected an array."));
        }
        for (var W = 0; W < A.length; W++) {
          var N = v(A, W, P, F, $ + "[" + W + "]", r);
          if (N instanceof Error)
            return N;
        }
        return null;
      }
      return m(T);
    }
    function U() {
      function v(T, j, k, P, F) {
        var $ = T[j];
        if (!c($)) {
          var A = le($);
          return new h("Invalid " + P + " `" + F + "` of type " + ("`" + A + "` supplied to `" + k + "`, expected a single ReactElement."));
        }
        return null;
      }
      return m(v);
    }
    function g() {
      function v(T, j, k, P, F) {
        var $ = T[j];
        if (!e.isValidElementType($)) {
          var A = le($);
          return new h("Invalid " + P + " `" + F + "` of type " + ("`" + A + "` supplied to `" + k + "`, expected a single ReactElement type."));
        }
        return null;
      }
      return m(v);
    }
    function I(v) {
      function T(j, k, P, F, $) {
        if (!(j[k] instanceof v)) {
          var A = v.name || d, D = _e(j[k]);
          return new h("Invalid " + F + " `" + $ + "` of type " + ("`" + D + "` supplied to `" + P + "`, expected ") + ("instance of `" + A + "`."));
        }
        return null;
      }
      return m(T);
    }
    function ee(v) {
      if (!Array.isArray(v))
        return process.env.NODE_ENV !== "production" && (arguments.length > 1 ? i(
          "Invalid arguments supplied to oneOf, expected an array, got " + arguments.length + " arguments. A common mistake is to write oneOf(x, y, z) instead of oneOf([x, y, z])."
        ) : i("Invalid argument supplied to oneOf, expected an array.")), s;
      function T(j, k, P, F, $) {
        for (var A = j[k], D = 0; D < v.length; D++)
          if (x(A, v[D]))
            return null;
        var W = JSON.stringify(v, function(se, b) {
          var de = he(b);
          return de === "symbol" ? String(b) : b;
        });
        return new h("Invalid " + F + " `" + $ + "` of value `" + String(A) + "` " + ("supplied to `" + P + "`, expected one of " + W + "."));
      }
      return m(T);
    }
    function ce(v) {
      function T(j, k, P, F, $) {
        if (typeof v != "function")
          return new h("Property `" + $ + "` of component `" + P + "` has invalid PropType notation inside objectOf.");
        var A = j[k], D = le(A);
        if (D !== "object")
          return new h("Invalid " + F + " `" + $ + "` of type " + ("`" + D + "` supplied to `" + P + "`, expected an object."));
        for (var W in A)
          if (n(A, W)) {
            var N = v(A, W, P, F, $ + "." + W, r);
            if (N instanceof Error)
              return N;
          }
        return null;
      }
      return m(T);
    }
    function M(v) {
      if (!Array.isArray(v))
        return process.env.NODE_ENV !== "production" && i("Invalid argument supplied to oneOfType, expected an instance of array."), s;
      for (var T = 0; T < v.length; T++) {
        var j = v[T];
        if (typeof j != "function")
          return i(
            "Invalid argument supplied to oneOfType. Expected an array of check functions, but received " + be(j) + " at index " + T + "."
          ), s;
      }
      function k(P, F, $, A, D) {
        for (var W = [], N = 0; N < v.length; N++) {
          var se = v[N], b = se(P, F, $, A, D, r);
          if (b == null)
            return null;
          b.data && n(b.data, "expectedType") && W.push(b.data.expectedType);
        }
        var de = W.length > 0 ? ", expected one of type [" + W.join(", ") + "]" : "";
        return new h("Invalid " + A + " `" + D + "` supplied to " + ("`" + $ + "`" + de + "."));
      }
      return m(k);
    }
    function J() {
      function v(T, j, k, P, F) {
        return oe(T[j]) ? null : new h("Invalid " + P + " `" + F + "` supplied to " + ("`" + k + "`, expected a ReactNode."));
      }
      return m(v);
    }
    function ue(v, T, j, k, P) {
      return new h(
        (v || "React class") + ": " + T + " type `" + j + "." + k + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + P + "`."
      );
    }
    function pe(v) {
      function T(j, k, P, F, $) {
        var A = j[k], D = le(A);
        if (D !== "object")
          return new h("Invalid " + F + " `" + $ + "` of type `" + D + "` " + ("supplied to `" + P + "`, expected `object`."));
        for (var W in v) {
          var N = v[W];
          if (typeof N != "function")
            return ue(P, F, $, W, he(N));
          var se = N(A, W, P, F, $ + "." + W, r);
          if (se)
            return se;
        }
        return null;
      }
      return m(T);
    }
    function ae(v) {
      function T(j, k, P, F, $) {
        var A = j[k], D = le(A);
        if (D !== "object")
          return new h("Invalid " + F + " `" + $ + "` of type `" + D + "` " + ("supplied to `" + P + "`, expected `object`."));
        var W = t({}, j[k], v);
        for (var N in W) {
          var se = v[N];
          if (n(v, N) && typeof se != "function")
            return ue(P, F, $, N, he(se));
          if (!se)
            return new h(
              "Invalid " + F + " `" + $ + "` key `" + N + "` supplied to `" + P + "`.\nBad object: " + JSON.stringify(j[k], null, "  ") + `
Valid keys: ` + JSON.stringify(Object.keys(v), null, "  ")
            );
          var b = se(A, N, P, F, $ + "." + N, r);
          if (b)
            return b;
        }
        return null;
      }
      return m(T);
    }
    function oe(v) {
      switch (typeof v) {
        case "number":
        case "string":
        case "undefined":
          return !0;
        case "boolean":
          return !v;
        case "object":
          if (Array.isArray(v))
            return v.every(oe);
          if (v === null || c(v))
            return !0;
          var T = p(v);
          if (T) {
            var j = T.call(v), k;
            if (T !== v.entries) {
              for (; !(k = j.next()).done; )
                if (!oe(k.value))
                  return !1;
            } else
              for (; !(k = j.next()).done; ) {
                var P = k.value;
                if (P && !oe(P[1]))
                  return !1;
              }
          } else
            return !1;
          return !0;
        default:
          return !1;
      }
    }
    function ge(v, T) {
      return v === "symbol" ? !0 : T ? T["@@toStringTag"] === "Symbol" || typeof Symbol == "function" && T instanceof Symbol : !1;
    }
    function le(v) {
      var T = typeof v;
      return Array.isArray(v) ? "array" : v instanceof RegExp ? "object" : ge(T, v) ? "symbol" : T;
    }
    function he(v) {
      if (typeof v > "u" || v === null)
        return "" + v;
      var T = le(v);
      if (T === "object") {
        if (v instanceof Date)
          return "date";
        if (v instanceof RegExp)
          return "regexp";
      }
      return T;
    }
    function be(v) {
      var T = he(v);
      switch (T) {
        case "array":
        case "object":
          return "an " + T;
        case "boolean":
        case "date":
        case "regexp":
          return "a " + T;
        default:
          return T;
      }
    }
    function _e(v) {
      return !v.constructor || !v.constructor.name ? d : v.constructor.name;
    }
    return S.checkPropTypes = o, S.resetWarningCache = o.resetWarningCache, S.PropTypes = S, S;
  }, jt;
}
var Mt, Ir;
function Io() {
  if (Ir)
    return Mt;
  Ir = 1;
  var e = Kt();
  function t() {
  }
  function r() {
  }
  return r.resetWarningCache = t, Mt = function() {
    function n(s, c, u, l, f, p) {
      if (p !== e) {
        var d = new Error(
          "Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types"
        );
        throw d.name = "Invariant Violation", d;
      }
    }
    n.isRequired = n;
    function o() {
      return n;
    }
    var i = {
      array: n,
      bigint: n,
      bool: n,
      func: n,
      number: n,
      object: n,
      string: n,
      symbol: n,
      any: n,
      arrayOf: o,
      element: n,
      elementType: n,
      instanceOf: o,
      node: n,
      objectOf: o,
      oneOf: o,
      oneOfType: o,
      shape: o,
      exact: o,
      checkPropTypes: r,
      resetWarningCache: t
    };
    return i.PropTypes = i, i;
  }, Mt;
}
if (process.env.NODE_ENV !== "production") {
  var Ao = an(), ko = !0;
  xr.exports = $o()(Ao.isElement, ko);
} else
  xr.exports = Io()();
function ze(e) {
  let t = "https://mui.com/production-error/?code=" + e;
  for (let r = 1; r < arguments.length; r += 1)
    t += "&args[]=" + encodeURIComponent(arguments[r]);
  return "Minified MUI error #" + e + "; visit " + t + " for the full message.";
}
var dt = {}, jo = {
  get exports() {
    return dt;
  },
  set exports(e) {
    dt = e;
  }
}, q = {};
/**
 * @license React
 * react-is.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Ar;
function Mo() {
  if (Ar)
    return q;
  Ar = 1;
  var e = Symbol.for("react.element"), t = Symbol.for("react.portal"), r = Symbol.for("react.fragment"), n = Symbol.for("react.strict_mode"), o = Symbol.for("react.profiler"), i = Symbol.for("react.provider"), s = Symbol.for("react.context"), c = Symbol.for("react.server_context"), u = Symbol.for("react.forward_ref"), l = Symbol.for("react.suspense"), f = Symbol.for("react.suspense_list"), p = Symbol.for("react.memo"), d = Symbol.for("react.lazy"), S = Symbol.for("react.offscreen"), x;
  x = Symbol.for("react.module.reference");
  function h(m) {
    if (typeof m == "object" && m !== null) {
      var O = m.$$typeof;
      switch (O) {
        case e:
          switch (m = m.type, m) {
            case r:
            case o:
            case n:
            case l:
            case f:
              return m;
            default:
              switch (m = m && m.$$typeof, m) {
                case c:
                case s:
                case u:
                case d:
                case p:
                case i:
                  return m;
                default:
                  return O;
              }
          }
        case t:
          return O;
      }
    }
  }
  return q.ContextConsumer = s, q.ContextProvider = i, q.Element = e, q.ForwardRef = u, q.Fragment = r, q.Lazy = d, q.Memo = p, q.Portal = t, q.Profiler = o, q.StrictMode = n, q.Suspense = l, q.SuspenseList = f, q.isAsyncMode = function() {
    return !1;
  }, q.isConcurrentMode = function() {
    return !1;
  }, q.isContextConsumer = function(m) {
    return h(m) === s;
  }, q.isContextProvider = function(m) {
    return h(m) === i;
  }, q.isElement = function(m) {
    return typeof m == "object" && m !== null && m.$$typeof === e;
  }, q.isForwardRef = function(m) {
    return h(m) === u;
  }, q.isFragment = function(m) {
    return h(m) === r;
  }, q.isLazy = function(m) {
    return h(m) === d;
  }, q.isMemo = function(m) {
    return h(m) === p;
  }, q.isPortal = function(m) {
    return h(m) === t;
  }, q.isProfiler = function(m) {
    return h(m) === o;
  }, q.isStrictMode = function(m) {
    return h(m) === n;
  }, q.isSuspense = function(m) {
    return h(m) === l;
  }, q.isSuspenseList = function(m) {
    return h(m) === f;
  }, q.isValidElementType = function(m) {
    return typeof m == "string" || typeof m == "function" || m === r || m === o || m === n || m === l || m === f || m === S || typeof m == "object" && m !== null && (m.$$typeof === d || m.$$typeof === p || m.$$typeof === i || m.$$typeof === s || m.$$typeof === u || m.$$typeof === x || m.getModuleId !== void 0);
  }, q.typeOf = h, q;
}
var K = {};
/**
 * @license React
 * react-is.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var kr;
function Do() {
  return kr || (kr = 1, process.env.NODE_ENV !== "production" && function() {
    var e = Symbol.for("react.element"), t = Symbol.for("react.portal"), r = Symbol.for("react.fragment"), n = Symbol.for("react.strict_mode"), o = Symbol.for("react.profiler"), i = Symbol.for("react.provider"), s = Symbol.for("react.context"), c = Symbol.for("react.server_context"), u = Symbol.for("react.forward_ref"), l = Symbol.for("react.suspense"), f = Symbol.for("react.suspense_list"), p = Symbol.for("react.memo"), d = Symbol.for("react.lazy"), S = Symbol.for("react.offscreen"), x = !1, h = !1, m = !1, O = !1, _ = !1, R;
    R = Symbol.for("react.module.reference");
    function U(w) {
      return !!(typeof w == "string" || typeof w == "function" || w === r || w === o || _ || w === n || w === l || w === f || O || w === S || x || h || m || typeof w == "object" && w !== null && (w.$$typeof === d || w.$$typeof === p || w.$$typeof === i || w.$$typeof === s || w.$$typeof === u || // This needs to include all possible module reference object
      // types supported by any Flight configuration anywhere since
      // we don't know which Flight build this will end up being used
      // with.
      w.$$typeof === R || w.getModuleId !== void 0));
    }
    function g(w) {
      if (typeof w == "object" && w !== null) {
        var ve = w.$$typeof;
        switch (ve) {
          case e:
            var we = w.type;
            switch (we) {
              case r:
              case o:
              case n:
              case l:
              case f:
                return we;
              default:
                var Ve = we && we.$$typeof;
                switch (Ve) {
                  case c:
                  case s:
                  case u:
                  case d:
                  case p:
                  case i:
                    return Ve;
                  default:
                    return ve;
                }
            }
          case t:
            return ve;
        }
      }
    }
    var I = s, ee = i, ce = e, M = u, J = r, ue = d, pe = p, ae = t, oe = o, ge = n, le = l, he = f, be = !1, _e = !1;
    function v(w) {
      return be || (be = !0, console.warn("The ReactIs.isAsyncMode() alias has been deprecated, and will be removed in React 18+.")), !1;
    }
    function T(w) {
      return _e || (_e = !0, console.warn("The ReactIs.isConcurrentMode() alias has been deprecated, and will be removed in React 18+.")), !1;
    }
    function j(w) {
      return g(w) === s;
    }
    function k(w) {
      return g(w) === i;
    }
    function P(w) {
      return typeof w == "object" && w !== null && w.$$typeof === e;
    }
    function F(w) {
      return g(w) === u;
    }
    function $(w) {
      return g(w) === r;
    }
    function A(w) {
      return g(w) === d;
    }
    function D(w) {
      return g(w) === p;
    }
    function W(w) {
      return g(w) === t;
    }
    function N(w) {
      return g(w) === o;
    }
    function se(w) {
      return g(w) === n;
    }
    function b(w) {
      return g(w) === l;
    }
    function de(w) {
      return g(w) === f;
    }
    K.ContextConsumer = I, K.ContextProvider = ee, K.Element = ce, K.ForwardRef = M, K.Fragment = J, K.Lazy = ue, K.Memo = pe, K.Portal = ae, K.Profiler = oe, K.StrictMode = ge, K.Suspense = le, K.SuspenseList = he, K.isAsyncMode = v, K.isConcurrentMode = T, K.isContextConsumer = j, K.isContextProvider = k, K.isElement = P, K.isForwardRef = F, K.isFragment = $, K.isLazy = A, K.isMemo = D, K.isPortal = W, K.isProfiler = N, K.isStrictMode = se, K.isSuspense = b, K.isSuspenseList = de, K.isValidElementType = U, K.typeOf = g;
  }()), K;
}
(function(e) {
  process.env.NODE_ENV === "production" ? e.exports = Mo() : e.exports = Do();
})(jo);
const No = /^\s*function(?:\s|\s*\/\*.*\*\/\s*)+([^(\s/]*)\s*/;
function Fo(e) {
  const t = `${e}`.match(No);
  return t && t[1] || "";
}
function un(e, t = "") {
  return e.displayName || e.name || Fo(e) || t;
}
function jr(e, t, r) {
  const n = un(t);
  return e.displayName || (n !== "" ? `${r}(${n})` : r);
}
function Lo(e) {
  if (e != null) {
    if (typeof e == "string")
      return e;
    if (typeof e == "function")
      return un(e, "Component");
    if (typeof e == "object")
      switch (e.$$typeof) {
        case dt.ForwardRef:
          return jr(e, e.render, "ForwardRef");
        case dt.Memo:
          return jr(e, e.type, "memo");
        default:
          return;
      }
  }
}
function Be(e) {
  if (typeof e != "string")
    throw new Error(process.env.NODE_ENV !== "production" ? "MUI: `capitalize(string)` expects a string argument." : ze(7));
  return e.charAt(0).toUpperCase() + e.slice(1);
}
const Mr = (e) => e, Wo = () => {
  let e = Mr;
  return {
    configure(t) {
      e = t;
    },
    generate(t) {
      return e(t);
    },
    reset() {
      e = Mr;
    }
  };
}, Bo = Wo(), Uo = Bo, zo = {
  active: "active",
  checked: "checked",
  completed: "completed",
  disabled: "disabled",
  readOnly: "readOnly",
  error: "error",
  expanded: "expanded",
  focused: "focused",
  focusVisible: "focusVisible",
  required: "required",
  selected: "selected"
};
function Yo(e, t, r = "Mui") {
  const n = zo[t];
  return n ? `${r}-${n}` : `${Uo.generate(e)}-${t}`;
}
function Se(e, t) {
  if (e == null)
    return {};
  var r = {}, n = Object.keys(e), o, i;
  for (i = 0; i < n.length; i++)
    o = n[i], !(t.indexOf(o) >= 0) && (r[o] = e[o]);
  return r;
}
/**
 * @mui/styled-engine v5.11.11
 *
 * @license MIT
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
function Vo(e, t) {
  const r = So(e, t);
  return process.env.NODE_ENV !== "production" ? (...n) => {
    const o = typeof e == "string" ? `"${e}"` : "component";
    return n.length === 0 ? console.error([`MUI: Seems like you called \`styled(${o})()\` without a \`style\` argument.`, 'You must provide a `styles` argument: `styled("div")(styleYouForgotToPass)`.'].join(`
`)) : n.some((i) => i === void 0) && console.error(`MUI: the styled(${o})(...args) API requires all its args to be defined.`), r(...n);
  } : r;
}
const qo = (e, t) => {
  Array.isArray(e.__emotion_styles) && (e.__emotion_styles = t(e.__emotion_styles));
}, Ko = process.env.NODE_ENV !== "production" ? Ie.oneOfType([Ie.number, Ie.string, Ie.object, Ie.array]) : {}, $e = Ko;
function Qe(e, t) {
  return t ? Re(e, t, {
    clone: !1
    // No need to clone deep, it's way faster.
  }) : e;
}
const Gt = {
  xs: 0,
  // phone
  sm: 600,
  // tablet
  md: 900,
  // small laptop
  lg: 1200,
  // desktop
  xl: 1536
  // large screen
}, Dr = {
  // Sorted ASC by size. That's important.
  // It can't be configured as it's used statically for propTypes.
  keys: ["xs", "sm", "md", "lg", "xl"],
  up: (e) => `@media (min-width:${Gt[e]}px)`
};
function Te(e, t, r) {
  const n = e.theme || {};
  if (Array.isArray(t)) {
    const i = n.breakpoints || Dr;
    return t.reduce((s, c, u) => (s[i.up(i.keys[u])] = r(t[u]), s), {});
  }
  if (typeof t == "object") {
    const i = n.breakpoints || Dr;
    return Object.keys(t).reduce((s, c) => {
      if (Object.keys(i.values || Gt).indexOf(c) !== -1) {
        const u = i.up(c);
        s[u] = r(t[c], c);
      } else {
        const u = c;
        s[u] = t[u];
      }
      return s;
    }, {});
  }
  return r(t);
}
function Go(e = {}) {
  var t;
  return ((t = e.keys) == null ? void 0 : t.reduce((n, o) => {
    const i = e.up(o);
    return n[i] = {}, n;
  }, {})) || {};
}
function Ho(e, t) {
  return e.reduce((r, n) => {
    const o = r[n];
    return (!o || Object.keys(o).length === 0) && delete r[n], r;
  }, t);
}
function ht(e, t, r = !0) {
  if (!t || typeof t != "string")
    return null;
  if (e && e.vars && r) {
    const n = `vars.${t}`.split(".").reduce((o, i) => o && o[i] ? o[i] : null, e);
    if (n != null)
      return n;
  }
  return t.split(".").reduce((n, o) => n && n[o] != null ? n[o] : null, e);
}
function pt(e, t, r, n = r) {
  let o;
  return typeof e == "function" ? o = e(r) : Array.isArray(e) ? o = e[r] || n : o = ht(e, r) || n, t && (o = t(o, n, e)), o;
}
function G(e) {
  const {
    prop: t,
    cssProperty: r = e.prop,
    themeKey: n,
    transform: o
  } = e, i = (s) => {
    if (s[t] == null)
      return null;
    const c = s[t], u = s.theme, l = ht(u, n) || {};
    return Te(s, c, (p) => {
      let d = pt(l, o, p);
      return p === d && typeof p == "string" && (d = pt(l, o, `${t}${p === "default" ? "" : Be(p)}`, p)), r === !1 ? d : {
        [r]: d
      };
    });
  };
  return i.propTypes = process.env.NODE_ENV !== "production" ? {
    [t]: $e
  } : {}, i.filterProps = [t], i;
}
function yt(...e) {
  const t = e.reduce((n, o) => (o.filterProps.forEach((i) => {
    n[i] = o;
  }), n), {}), r = (n) => Object.keys(n).reduce((o, i) => t[i] ? Qe(o, t[i](n)) : o, {});
  return r.propTypes = process.env.NODE_ENV !== "production" ? e.reduce((n, o) => Object.assign(n, o.propTypes), {}) : {}, r.filterProps = e.reduce((n, o) => n.concat(o.filterProps), []), r;
}
function Jo(e) {
  const t = {};
  return (r) => (t[r] === void 0 && (t[r] = e(r)), t[r]);
}
const Xo = {
  m: "margin",
  p: "padding"
}, Qo = {
  t: "Top",
  r: "Right",
  b: "Bottom",
  l: "Left",
  x: ["Left", "Right"],
  y: ["Top", "Bottom"]
}, Nr = {
  marginX: "mx",
  marginY: "my",
  paddingX: "px",
  paddingY: "py"
}, Zo = Jo((e) => {
  if (e.length > 2)
    if (Nr[e])
      e = Nr[e];
    else
      return [e];
  const [t, r] = e.split(""), n = Xo[t], o = Qo[r] || "";
  return Array.isArray(o) ? o.map((i) => n + i) : [n + o];
}), gt = ["m", "mt", "mr", "mb", "ml", "mx", "my", "margin", "marginTop", "marginRight", "marginBottom", "marginLeft", "marginX", "marginY", "marginInline", "marginInlineStart", "marginInlineEnd", "marginBlock", "marginBlockStart", "marginBlockEnd"], vt = ["p", "pt", "pr", "pb", "pl", "px", "py", "padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "paddingX", "paddingY", "paddingInline", "paddingInlineStart", "paddingInlineEnd", "paddingBlock", "paddingBlockStart", "paddingBlockEnd"], ei = [...gt, ...vt];
function nt(e, t, r, n) {
  var o;
  const i = (o = ht(e, t, !1)) != null ? o : r;
  return typeof i == "number" ? (s) => typeof s == "string" ? s : (process.env.NODE_ENV !== "production" && typeof s != "number" && console.error(`MUI: Expected ${n} argument to be a number or a string, got ${s}.`), i * s) : Array.isArray(i) ? (s) => typeof s == "string" ? s : (process.env.NODE_ENV !== "production" && (Number.isInteger(s) ? s > i.length - 1 && console.error([`MUI: The value provided (${s}) overflows.`, `The supported values are: ${JSON.stringify(i)}.`, `${s} > ${i.length - 1}, you need to add the missing values.`].join(`
`)) : console.error([`MUI: The \`theme.${t}\` array type cannot be combined with non integer values.You should either use an integer value that can be used as index, or define the \`theme.${t}\` as a number.`].join(`
`))), i[s]) : typeof i == "function" ? i : (process.env.NODE_ENV !== "production" && console.error([`MUI: The \`theme.${t}\` value (${i}) is invalid.`, "It should be a number, an array or a function."].join(`
`)), () => {
  });
}
function ln(e) {
  return nt(e, "spacing", 8, "spacing");
}
function ot(e, t) {
  if (typeof t == "string" || t == null)
    return t;
  const r = Math.abs(t), n = e(r);
  return t >= 0 ? n : typeof n == "number" ? -n : `-${n}`;
}
function ti(e, t) {
  return (r) => e.reduce((n, o) => (n[o] = ot(t, r), n), {});
}
function ri(e, t, r, n) {
  if (t.indexOf(r) === -1)
    return null;
  const o = Zo(r), i = ti(o, n), s = e[r];
  return Te(e, s, i);
}
function fn(e, t) {
  const r = ln(e.theme);
  return Object.keys(e).map((n) => ri(e, t, n, r)).reduce(Qe, {});
}
function te(e) {
  return fn(e, gt);
}
te.propTypes = process.env.NODE_ENV !== "production" ? gt.reduce((e, t) => (e[t] = $e, e), {}) : {};
te.filterProps = gt;
function re(e) {
  return fn(e, vt);
}
re.propTypes = process.env.NODE_ENV !== "production" ? vt.reduce((e, t) => (e[t] = $e, e), {}) : {};
re.filterProps = vt;
process.env.NODE_ENV !== "production" && ei.reduce((e, t) => (e[t] = $e, e), {});
function Ee(e) {
  return typeof e != "number" ? e : `${e}px solid`;
}
const ni = G({
  prop: "border",
  themeKey: "borders",
  transform: Ee
}), oi = G({
  prop: "borderTop",
  themeKey: "borders",
  transform: Ee
}), ii = G({
  prop: "borderRight",
  themeKey: "borders",
  transform: Ee
}), si = G({
  prop: "borderBottom",
  themeKey: "borders",
  transform: Ee
}), ai = G({
  prop: "borderLeft",
  themeKey: "borders",
  transform: Ee
}), ci = G({
  prop: "borderColor",
  themeKey: "palette"
}), ui = G({
  prop: "borderTopColor",
  themeKey: "palette"
}), li = G({
  prop: "borderRightColor",
  themeKey: "palette"
}), fi = G({
  prop: "borderBottomColor",
  themeKey: "palette"
}), di = G({
  prop: "borderLeftColor",
  themeKey: "palette"
}), bt = (e) => {
  if (e.borderRadius !== void 0 && e.borderRadius !== null) {
    const t = nt(e.theme, "shape.borderRadius", 4, "borderRadius"), r = (n) => ({
      borderRadius: ot(t, n)
    });
    return Te(e, e.borderRadius, r);
  }
  return null;
};
bt.propTypes = process.env.NODE_ENV !== "production" ? {
  borderRadius: $e
} : {};
bt.filterProps = ["borderRadius"];
yt(ni, oi, ii, si, ai, ci, ui, li, fi, di, bt);
const Et = (e) => {
  if (e.gap !== void 0 && e.gap !== null) {
    const t = nt(e.theme, "spacing", 8, "gap"), r = (n) => ({
      gap: ot(t, n)
    });
    return Te(e, e.gap, r);
  }
  return null;
};
Et.propTypes = process.env.NODE_ENV !== "production" ? {
  gap: $e
} : {};
Et.filterProps = ["gap"];
const St = (e) => {
  if (e.columnGap !== void 0 && e.columnGap !== null) {
    const t = nt(e.theme, "spacing", 8, "columnGap"), r = (n) => ({
      columnGap: ot(t, n)
    });
    return Te(e, e.columnGap, r);
  }
  return null;
};
St.propTypes = process.env.NODE_ENV !== "production" ? {
  columnGap: $e
} : {};
St.filterProps = ["columnGap"];
const xt = (e) => {
  if (e.rowGap !== void 0 && e.rowGap !== null) {
    const t = nt(e.theme, "spacing", 8, "rowGap"), r = (n) => ({
      rowGap: ot(t, n)
    });
    return Te(e, e.rowGap, r);
  }
  return null;
};
xt.propTypes = process.env.NODE_ENV !== "production" ? {
  rowGap: $e
} : {};
xt.filterProps = ["rowGap"];
const pi = G({
  prop: "gridColumn"
}), mi = G({
  prop: "gridRow"
}), hi = G({
  prop: "gridAutoFlow"
}), yi = G({
  prop: "gridAutoColumns"
}), gi = G({
  prop: "gridAutoRows"
}), vi = G({
  prop: "gridTemplateColumns"
}), bi = G({
  prop: "gridTemplateRows"
}), Ei = G({
  prop: "gridTemplateAreas"
}), Si = G({
  prop: "gridArea"
});
yt(Et, St, xt, pi, mi, hi, yi, gi, vi, bi, Ei, Si);
function Ue(e, t) {
  return t === "grey" ? t : e;
}
const xi = G({
  prop: "color",
  themeKey: "palette",
  transform: Ue
}), Ti = G({
  prop: "bgcolor",
  cssProperty: "backgroundColor",
  themeKey: "palette",
  transform: Ue
}), _i = G({
  prop: "backgroundColor",
  themeKey: "palette",
  transform: Ue
});
yt(xi, Ti, _i);
function me(e) {
  return e <= 1 && e !== 0 ? `${e * 100}%` : e;
}
const wi = G({
  prop: "width",
  transform: me
}), Ht = (e) => {
  if (e.maxWidth !== void 0 && e.maxWidth !== null) {
    const t = (r) => {
      var n, o, i;
      return {
        maxWidth: ((n = e.theme) == null || (o = n.breakpoints) == null || (i = o.values) == null ? void 0 : i[r]) || Gt[r] || me(r)
      };
    };
    return Te(e, e.maxWidth, t);
  }
  return null;
};
Ht.filterProps = ["maxWidth"];
const Oi = G({
  prop: "minWidth",
  transform: me
}), Ri = G({
  prop: "height",
  transform: me
}), Ci = G({
  prop: "maxHeight",
  transform: me
}), Pi = G({
  prop: "minHeight",
  transform: me
});
G({
  prop: "size",
  cssProperty: "width",
  transform: me
});
G({
  prop: "size",
  cssProperty: "height",
  transform: me
});
const $i = G({
  prop: "boxSizing"
});
yt(wi, Ht, Oi, Ri, Ci, Pi, $i);
const Dt = (e) => (t) => {
  if (t[e] !== void 0 && t[e] !== null) {
    const r = (n) => {
      var o, i;
      let s = (o = t.theme.typography) == null ? void 0 : o[`${e}${t[e] === "default" || t[e] === e ? "" : Be((i = t[e]) == null ? void 0 : i.toString())}`];
      if (!s) {
        var c, u;
        s = (c = t.theme.typography) == null || (u = c[n]) == null ? void 0 : u[e];
      }
      return s || (s = n), {
        [e]: s
      };
    };
    return Te(t, t[e], r);
  }
  return null;
}, Ii = {
  // borders
  border: {
    themeKey: "borders",
    transform: Ee
  },
  borderTop: {
    themeKey: "borders",
    transform: Ee
  },
  borderRight: {
    themeKey: "borders",
    transform: Ee
  },
  borderBottom: {
    themeKey: "borders",
    transform: Ee
  },
  borderLeft: {
    themeKey: "borders",
    transform: Ee
  },
  borderColor: {
    themeKey: "palette"
  },
  borderTopColor: {
    themeKey: "palette"
  },
  borderRightColor: {
    themeKey: "palette"
  },
  borderBottomColor: {
    themeKey: "palette"
  },
  borderLeftColor: {
    themeKey: "palette"
  },
  borderRadius: {
    themeKey: "shape.borderRadius",
    style: bt
  },
  // palette
  color: {
    themeKey: "palette",
    transform: Ue
  },
  bgcolor: {
    themeKey: "palette",
    cssProperty: "backgroundColor",
    transform: Ue
  },
  backgroundColor: {
    themeKey: "palette",
    transform: Ue
  },
  // spacing
  p: {
    style: re
  },
  pt: {
    style: re
  },
  pr: {
    style: re
  },
  pb: {
    style: re
  },
  pl: {
    style: re
  },
  px: {
    style: re
  },
  py: {
    style: re
  },
  padding: {
    style: re
  },
  paddingTop: {
    style: re
  },
  paddingRight: {
    style: re
  },
  paddingBottom: {
    style: re
  },
  paddingLeft: {
    style: re
  },
  paddingX: {
    style: re
  },
  paddingY: {
    style: re
  },
  paddingInline: {
    style: re
  },
  paddingInlineStart: {
    style: re
  },
  paddingInlineEnd: {
    style: re
  },
  paddingBlock: {
    style: re
  },
  paddingBlockStart: {
    style: re
  },
  paddingBlockEnd: {
    style: re
  },
  m: {
    style: te
  },
  mt: {
    style: te
  },
  mr: {
    style: te
  },
  mb: {
    style: te
  },
  ml: {
    style: te
  },
  mx: {
    style: te
  },
  my: {
    style: te
  },
  margin: {
    style: te
  },
  marginTop: {
    style: te
  },
  marginRight: {
    style: te
  },
  marginBottom: {
    style: te
  },
  marginLeft: {
    style: te
  },
  marginX: {
    style: te
  },
  marginY: {
    style: te
  },
  marginInline: {
    style: te
  },
  marginInlineStart: {
    style: te
  },
  marginInlineEnd: {
    style: te
  },
  marginBlock: {
    style: te
  },
  marginBlockStart: {
    style: te
  },
  marginBlockEnd: {
    style: te
  },
  // display
  displayPrint: {
    cssProperty: !1,
    transform: (e) => ({
      "@media print": {
        display: e
      }
    })
  },
  display: {},
  overflow: {},
  textOverflow: {},
  visibility: {},
  whiteSpace: {},
  // flexbox
  flexBasis: {},
  flexDirection: {},
  flexWrap: {},
  justifyContent: {},
  alignItems: {},
  alignContent: {},
  order: {},
  flex: {},
  flexGrow: {},
  flexShrink: {},
  alignSelf: {},
  justifyItems: {},
  justifySelf: {},
  // grid
  gap: {
    style: Et
  },
  rowGap: {
    style: xt
  },
  columnGap: {
    style: St
  },
  gridColumn: {},
  gridRow: {},
  gridAutoFlow: {},
  gridAutoColumns: {},
  gridAutoRows: {},
  gridTemplateColumns: {},
  gridTemplateRows: {},
  gridTemplateAreas: {},
  gridArea: {},
  // positions
  position: {},
  zIndex: {
    themeKey: "zIndex"
  },
  top: {},
  right: {},
  bottom: {},
  left: {},
  // shadows
  boxShadow: {
    themeKey: "shadows"
  },
  // sizing
  width: {
    transform: me
  },
  maxWidth: {
    style: Ht
  },
  minWidth: {
    transform: me
  },
  height: {
    transform: me
  },
  maxHeight: {
    transform: me
  },
  minHeight: {
    transform: me
  },
  boxSizing: {},
  // typography
  fontFamily: {
    themeKey: "typography",
    style: Dt("fontFamily")
  },
  fontSize: {
    themeKey: "typography",
    style: Dt("fontSize")
  },
  fontStyle: {
    themeKey: "typography"
  },
  fontWeight: {
    themeKey: "typography",
    style: Dt("fontWeight")
  },
  letterSpacing: {},
  textTransform: {},
  lineHeight: {},
  textAlign: {},
  typography: {
    cssProperty: !1,
    themeKey: "typography"
  }
}, Jt = Ii;
function Ai(...e) {
  const t = e.reduce((n, o) => n.concat(Object.keys(o)), []), r = new Set(t);
  return e.every((n) => r.size === Object.keys(n).length);
}
function ki(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function ji() {
  function e(r, n, o, i) {
    const s = {
      [r]: n,
      theme: o
    }, c = i[r];
    if (!c)
      return {
        [r]: n
      };
    const {
      cssProperty: u = r,
      themeKey: l,
      transform: f,
      style: p
    } = c;
    if (n == null)
      return null;
    const d = ht(o, l) || {};
    return p ? p(s) : Te(s, n, (x) => {
      let h = pt(d, f, x);
      return x === h && typeof x == "string" && (h = pt(d, f, `${r}${x === "default" ? "" : Be(x)}`, x)), u === !1 ? h : {
        [u]: h
      };
    });
  }
  function t(r) {
    var n;
    const {
      sx: o,
      theme: i = {}
    } = r || {};
    if (!o)
      return null;
    const s = (n = i.unstable_sxConfig) != null ? n : Jt;
    function c(u) {
      let l = u;
      if (typeof u == "function")
        l = u(i);
      else if (typeof u != "object")
        return u;
      if (!l)
        return null;
      const f = Go(i.breakpoints), p = Object.keys(f);
      let d = f;
      return Object.keys(l).forEach((S) => {
        const x = ki(l[S], i);
        if (x != null)
          if (typeof x == "object")
            if (s[S])
              d = Qe(d, e(S, x, i, s));
            else {
              const h = Te({
                theme: i
              }, x, (m) => ({
                [S]: m
              }));
              Ai(h, x) ? d[S] = t({
                sx: x,
                theme: i
              }) : d = Qe(d, h);
            }
          else
            d = Qe(d, e(S, x, i, s));
      }), Ho(p, d);
    }
    return Array.isArray(o) ? o.map(c) : c(o);
  }
  return t;
}
const dn = ji();
dn.filterProps = ["sx"];
const Xt = dn;
function pn(e) {
  var t, r, n = "";
  if (typeof e == "string" || typeof e == "number")
    n += e;
  else if (typeof e == "object")
    if (Array.isArray(e))
      for (t = 0; t < e.length; t++)
        e[t] && (r = pn(e[t])) && (n && (n += " "), n += r);
    else
      for (t in e)
        e[t] && (n && (n += " "), n += t);
  return n;
}
function Qt() {
  for (var e, t, r = 0, n = ""; r < arguments.length; )
    (e = arguments[r++]) && (t = pn(e)) && (n && (n += " "), n += t);
  return n;
}
const Mi = ["values", "unit", "step"], Di = (e) => {
  const t = Object.keys(e).map((r) => ({
    key: r,
    val: e[r]
  })) || [];
  return t.sort((r, n) => r.val - n.val), t.reduce((r, n) => Z({}, r, {
    [n.key]: n.val
  }), {});
};
function Ni(e) {
  const {
    // The breakpoint **start** at this value.
    // For instance with the first breakpoint xs: [xs, sm).
    values: t = {
      xs: 0,
      // phone
      sm: 600,
      // tablet
      md: 900,
      // small laptop
      lg: 1200,
      // desktop
      xl: 1536
      // large screen
    },
    unit: r = "px",
    step: n = 5
  } = e, o = Se(e, Mi), i = Di(t), s = Object.keys(i);
  function c(d) {
    return `@media (min-width:${typeof t[d] == "number" ? t[d] : d}${r})`;
  }
  function u(d) {
    return `@media (max-width:${(typeof t[d] == "number" ? t[d] : d) - n / 100}${r})`;
  }
  function l(d, S) {
    const x = s.indexOf(S);
    return `@media (min-width:${typeof t[d] == "number" ? t[d] : d}${r}) and (max-width:${(x !== -1 && typeof t[s[x]] == "number" ? t[s[x]] : S) - n / 100}${r})`;
  }
  function f(d) {
    return s.indexOf(d) + 1 < s.length ? l(d, s[s.indexOf(d) + 1]) : c(d);
  }
  function p(d) {
    const S = s.indexOf(d);
    return S === 0 ? c(s[1]) : S === s.length - 1 ? u(s[S]) : l(d, s[s.indexOf(d) + 1]).replace("@media", "@media not all and");
  }
  return Z({
    keys: s,
    values: i,
    up: c,
    down: u,
    between: l,
    only: f,
    not: p,
    unit: r
  }, o);
}
const Fi = {
  borderRadius: 4
}, Li = Fi;
function Wi(e = 8) {
  if (e.mui)
    return e;
  const t = ln({
    spacing: e
  }), r = (...n) => (process.env.NODE_ENV !== "production" && (n.length <= 4 || console.error(`MUI: Too many arguments provided, expected between 0 and 4, got ${n.length}`)), (n.length === 0 ? [1] : n).map((i) => {
    const s = t(i);
    return typeof s == "number" ? `${s}px` : s;
  }).join(" "));
  return r.mui = !0, r;
}
const Bi = ["breakpoints", "palette", "spacing", "shape"];
function mn(e = {}, ...t) {
  const {
    breakpoints: r = {},
    palette: n = {},
    spacing: o,
    shape: i = {}
  } = e, s = Se(e, Bi), c = Ni(r), u = Wi(o);
  let l = Re({
    breakpoints: c,
    direction: "ltr",
    components: {},
    // Inject component definitions.
    palette: Z({
      mode: "light"
    }, n),
    spacing: u,
    shape: Z({}, Li, i)
  }, s);
  return l = t.reduce((f, p) => Re(f, p), l), l.unstable_sxConfig = Z({}, Jt, s == null ? void 0 : s.unstable_sxConfig), l.unstable_sx = function(p) {
    return Xt({
      sx: p,
      theme: this
    });
  }, l;
}
const Ui = ["variant"];
function Fr(e) {
  return e.length === 0;
}
function hn(e) {
  const {
    variant: t
  } = e, r = Se(e, Ui);
  let n = t || "";
  return Object.keys(r).sort().forEach((o) => {
    o === "color" ? n += Fr(n) ? e[o] : Be(e[o]) : n += `${Fr(n) ? o : Be(o)}${Be(e[o].toString())}`;
  }), n;
}
const zi = ["name", "slot", "skipVariantsResolver", "skipSx", "overridesResolver"], Yi = ["theme"], Vi = ["theme"];
function He(e) {
  return Object.keys(e).length === 0;
}
function qi(e) {
  return typeof e == "string" && // 96 is one less than the char code
  // for "a" so this is checking that
  // it's a lowercase character
  e.charCodeAt(0) > 96;
}
const Ki = (e, t) => t.components && t.components[e] && t.components[e].styleOverrides ? t.components[e].styleOverrides : null, Gi = (e, t) => {
  let r = [];
  t && t.components && t.components[e] && t.components[e].variants && (r = t.components[e].variants);
  const n = {};
  return r.forEach((o) => {
    const i = hn(o.props);
    n[i] = o.style;
  }), n;
}, Hi = (e, t, r, n) => {
  var o, i;
  const {
    ownerState: s = {}
  } = e, c = [], u = r == null || (o = r.components) == null || (i = o[n]) == null ? void 0 : i.variants;
  return u && u.forEach((l) => {
    let f = !0;
    Object.keys(l.props).forEach((p) => {
      s[p] !== l.props[p] && e[p] !== l.props[p] && (f = !1);
    }), f && c.push(t[hn(l.props)]);
  }), c;
};
function at(e) {
  return e !== "ownerState" && e !== "theme" && e !== "sx" && e !== "as";
}
const Ji = mn(), Xi = (e) => e.charAt(0).toLowerCase() + e.slice(1);
function Qi(e = {}) {
  const {
    defaultTheme: t = Ji,
    rootShouldForwardProp: r = at,
    slotShouldForwardProp: n = at
  } = e, o = (i) => {
    const s = He(i.theme) ? t : i.theme;
    return Xt(Z({}, i, {
      theme: s
    }));
  };
  return o.__mui_systemSx = !0, (i, s = {}) => {
    qo(i, (R) => R.filter((U) => !(U != null && U.__mui_systemSx)));
    const {
      name: c,
      slot: u,
      skipVariantsResolver: l,
      skipSx: f,
      overridesResolver: p
    } = s, d = Se(s, zi), S = l !== void 0 ? l : u && u !== "Root" || !1, x = f || !1;
    let h;
    process.env.NODE_ENV !== "production" && c && (h = `${c}-${Xi(u || "Root")}`);
    let m = at;
    u === "Root" ? m = r : u ? m = n : qi(i) && (m = void 0);
    const O = Vo(i, Z({
      shouldForwardProp: m,
      label: h
    }, d)), _ = (R, ...U) => {
      const g = U ? U.map((M) => typeof M == "function" && M.__emotion_real !== M ? (J) => {
        let {
          theme: ue
        } = J, pe = Se(J, Yi);
        return M(Z({
          theme: He(ue) ? t : ue
        }, pe));
      } : M) : [];
      let I = R;
      c && p && g.push((M) => {
        const J = He(M.theme) ? t : M.theme, ue = Ki(c, J);
        if (ue) {
          const pe = {};
          return Object.entries(ue).forEach(([ae, oe]) => {
            pe[ae] = typeof oe == "function" ? oe(Z({}, M, {
              theme: J
            })) : oe;
          }), p(M, pe);
        }
        return null;
      }), c && !S && g.push((M) => {
        const J = He(M.theme) ? t : M.theme;
        return Hi(M, Gi(c, J), J, c);
      }), x || g.push(o);
      const ee = g.length - U.length;
      if (Array.isArray(R) && ee > 0) {
        const M = new Array(ee).fill("");
        I = [...R, ...M], I.raw = [...R.raw, ...M];
      } else
        typeof R == "function" && // On the server Emotion doesn't use React.forwardRef for creating components, so the created
        // component stays as a function. This condition makes sure that we do not interpolate functions
        // which are basically components used as a selectors.
        R.__emotion_real !== R && (I = (M) => {
          let {
            theme: J
          } = M, ue = Se(M, Vi);
          return R(Z({
            theme: He(J) ? t : J
          }, ue));
        });
      const ce = O(I, ...g);
      if (process.env.NODE_ENV !== "production") {
        let M;
        c && (M = `${c}${u || ""}`), M === void 0 && (M = `Styled(${Lo(i)})`), ce.displayName = M;
      }
      return ce;
    };
    return O.withConfig && (_.withConfig = O.withConfig), _;
  };
}
function yn(e, t = 0, r = 1) {
  return process.env.NODE_ENV !== "production" && (e < t || e > r) && console.error(`MUI: The value provided ${e} is out of range [${t}, ${r}].`), Math.min(Math.max(t, e), r);
}
function Zi(e) {
  e = e.slice(1);
  const t = new RegExp(`.{1,${e.length >= 6 ? 2 : 1}}`, "g");
  let r = e.match(t);
  return r && r[0].length === 1 && (r = r.map((n) => n + n)), r ? `rgb${r.length === 4 ? "a" : ""}(${r.map((n, o) => o < 3 ? parseInt(n, 16) : Math.round(parseInt(n, 16) / 255 * 1e3) / 1e3).join(", ")})` : "";
}
function Ye(e) {
  if (e.type)
    return e;
  if (e.charAt(0) === "#")
    return Ye(Zi(e));
  const t = e.indexOf("("), r = e.substring(0, t);
  if (["rgb", "rgba", "hsl", "hsla", "color"].indexOf(r) === -1)
    throw new Error(process.env.NODE_ENV !== "production" ? `MUI: Unsupported \`${e}\` color.
The following formats are supported: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color().` : ze(9, e));
  let n = e.substring(t + 1, e.length - 1), o;
  if (r === "color") {
    if (n = n.split(" "), o = n.shift(), n.length === 4 && n[3].charAt(0) === "/" && (n[3] = n[3].slice(1)), ["srgb", "display-p3", "a98-rgb", "prophoto-rgb", "rec-2020"].indexOf(o) === -1)
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: unsupported \`${o}\` color space.
The following color spaces are supported: srgb, display-p3, a98-rgb, prophoto-rgb, rec-2020.` : ze(10, o));
  } else
    n = n.split(",");
  return n = n.map((i) => parseFloat(i)), {
    type: r,
    values: n,
    colorSpace: o
  };
}
function Zt(e) {
  const {
    type: t,
    colorSpace: r
  } = e;
  let {
    values: n
  } = e;
  return t.indexOf("rgb") !== -1 ? n = n.map((o, i) => i < 3 ? parseInt(o, 10) : o) : t.indexOf("hsl") !== -1 && (n[1] = `${n[1]}%`, n[2] = `${n[2]}%`), t.indexOf("color") !== -1 ? n = `${r} ${n.join(" ")}` : n = `${n.join(", ")}`, `${t}(${n})`;
}
function es(e) {
  e = Ye(e);
  const {
    values: t
  } = e, r = t[0], n = t[1] / 100, o = t[2] / 100, i = n * Math.min(o, 1 - o), s = (l, f = (l + r / 30) % 12) => o - i * Math.max(Math.min(f - 3, 9 - f, 1), -1);
  let c = "rgb";
  const u = [Math.round(s(0) * 255), Math.round(s(8) * 255), Math.round(s(4) * 255)];
  return e.type === "hsla" && (c += "a", u.push(t[3])), Zt({
    type: c,
    values: u
  });
}
function Lr(e) {
  e = Ye(e);
  let t = e.type === "hsl" || e.type === "hsla" ? Ye(es(e)).values : e.values;
  return t = t.map((r) => (e.type !== "color" && (r /= 255), r <= 0.03928 ? r / 12.92 : ((r + 0.055) / 1.055) ** 2.4)), Number((0.2126 * t[0] + 0.7152 * t[1] + 0.0722 * t[2]).toFixed(3));
}
function Wr(e, t) {
  const r = Lr(e), n = Lr(t);
  return (Math.max(r, n) + 0.05) / (Math.min(r, n) + 0.05);
}
function ts(e, t) {
  if (e = Ye(e), t = yn(t), e.type.indexOf("hsl") !== -1)
    e.values[2] *= 1 - t;
  else if (e.type.indexOf("rgb") !== -1 || e.type.indexOf("color") !== -1)
    for (let r = 0; r < 3; r += 1)
      e.values[r] *= 1 - t;
  return Zt(e);
}
function rs(e, t) {
  if (e = Ye(e), t = yn(t), e.type.indexOf("hsl") !== -1)
    e.values[2] += (100 - e.values[2]) * t;
  else if (e.type.indexOf("rgb") !== -1)
    for (let r = 0; r < 3; r += 1)
      e.values[r] += (255 - e.values[r]) * t;
  else if (e.type.indexOf("color") !== -1)
    for (let r = 0; r < 3; r += 1)
      e.values[r] += (1 - e.values[r]) * t;
  return Zt(e);
}
function ns(e, t) {
  return Z({
    toolbar: {
      minHeight: 56,
      [e.up("xs")]: {
        "@media (orientation: landscape)": {
          minHeight: 48
        }
      },
      [e.up("sm")]: {
        minHeight: 64
      }
    }
  }, t);
}
const os = {
  black: "#000",
  white: "#fff"
}, et = os, is = {
  50: "#fafafa",
  100: "#f5f5f5",
  200: "#eeeeee",
  300: "#e0e0e0",
  400: "#bdbdbd",
  500: "#9e9e9e",
  600: "#757575",
  700: "#616161",
  800: "#424242",
  900: "#212121",
  A100: "#f5f5f5",
  A200: "#eeeeee",
  A400: "#bdbdbd",
  A700: "#616161"
}, ss = is, as = {
  50: "#f3e5f5",
  100: "#e1bee7",
  200: "#ce93d8",
  300: "#ba68c8",
  400: "#ab47bc",
  500: "#9c27b0",
  600: "#8e24aa",
  700: "#7b1fa2",
  800: "#6a1b9a",
  900: "#4a148c",
  A100: "#ea80fc",
  A200: "#e040fb",
  A400: "#d500f9",
  A700: "#aa00ff"
}, Me = as, cs = {
  50: "#ffebee",
  100: "#ffcdd2",
  200: "#ef9a9a",
  300: "#e57373",
  400: "#ef5350",
  500: "#f44336",
  600: "#e53935",
  700: "#d32f2f",
  800: "#c62828",
  900: "#b71c1c",
  A100: "#ff8a80",
  A200: "#ff5252",
  A400: "#ff1744",
  A700: "#d50000"
}, De = cs, us = {
  50: "#fff3e0",
  100: "#ffe0b2",
  200: "#ffcc80",
  300: "#ffb74d",
  400: "#ffa726",
  500: "#ff9800",
  600: "#fb8c00",
  700: "#f57c00",
  800: "#ef6c00",
  900: "#e65100",
  A100: "#ffd180",
  A200: "#ffab40",
  A400: "#ff9100",
  A700: "#ff6d00"
}, Je = us, ls = {
  50: "#e3f2fd",
  100: "#bbdefb",
  200: "#90caf9",
  300: "#64b5f6",
  400: "#42a5f5",
  500: "#2196f3",
  600: "#1e88e5",
  700: "#1976d2",
  800: "#1565c0",
  900: "#0d47a1",
  A100: "#82b1ff",
  A200: "#448aff",
  A400: "#2979ff",
  A700: "#2962ff"
}, Ne = ls, fs = {
  50: "#e1f5fe",
  100: "#b3e5fc",
  200: "#81d4fa",
  300: "#4fc3f7",
  400: "#29b6f6",
  500: "#03a9f4",
  600: "#039be5",
  700: "#0288d1",
  800: "#0277bd",
  900: "#01579b",
  A100: "#80d8ff",
  A200: "#40c4ff",
  A400: "#00b0ff",
  A700: "#0091ea"
}, Fe = fs, ds = {
  50: "#e8f5e9",
  100: "#c8e6c9",
  200: "#a5d6a7",
  300: "#81c784",
  400: "#66bb6a",
  500: "#4caf50",
  600: "#43a047",
  700: "#388e3c",
  800: "#2e7d32",
  900: "#1b5e20",
  A100: "#b9f6ca",
  A200: "#69f0ae",
  A400: "#00e676",
  A700: "#00c853"
}, Le = ds, ps = ["mode", "contrastThreshold", "tonalOffset"], Br = {
  // The colors used to style the text.
  text: {
    // The most important text.
    primary: "rgba(0, 0, 0, 0.87)",
    // Secondary text.
    secondary: "rgba(0, 0, 0, 0.6)",
    // Disabled text have even lower visual prominence.
    disabled: "rgba(0, 0, 0, 0.38)"
  },
  // The color used to divide different elements.
  divider: "rgba(0, 0, 0, 0.12)",
  // The background colors used to style the surfaces.
  // Consistency between these values is important.
  background: {
    paper: et.white,
    default: et.white
  },
  // The colors used to style the action elements.
  action: {
    // The color of an active action like an icon button.
    active: "rgba(0, 0, 0, 0.54)",
    // The color of an hovered action.
    hover: "rgba(0, 0, 0, 0.04)",
    hoverOpacity: 0.04,
    // The color of a selected action.
    selected: "rgba(0, 0, 0, 0.08)",
    selectedOpacity: 0.08,
    // The color of a disabled action.
    disabled: "rgba(0, 0, 0, 0.26)",
    // The background color of a disabled action.
    disabledBackground: "rgba(0, 0, 0, 0.12)",
    disabledOpacity: 0.38,
    focus: "rgba(0, 0, 0, 0.12)",
    focusOpacity: 0.12,
    activatedOpacity: 0.12
  }
}, Nt = {
  text: {
    primary: et.white,
    secondary: "rgba(255, 255, 255, 0.7)",
    disabled: "rgba(255, 255, 255, 0.5)",
    icon: "rgba(255, 255, 255, 0.5)"
  },
  divider: "rgba(255, 255, 255, 0.12)",
  background: {
    paper: "#121212",
    default: "#121212"
  },
  action: {
    active: et.white,
    hover: "rgba(255, 255, 255, 0.08)",
    hoverOpacity: 0.08,
    selected: "rgba(255, 255, 255, 0.16)",
    selectedOpacity: 0.16,
    disabled: "rgba(255, 255, 255, 0.3)",
    disabledBackground: "rgba(255, 255, 255, 0.12)",
    disabledOpacity: 0.38,
    focus: "rgba(255, 255, 255, 0.12)",
    focusOpacity: 0.12,
    activatedOpacity: 0.24
  }
};
function Ur(e, t, r, n) {
  const o = n.light || n, i = n.dark || n * 1.5;
  e[t] || (e.hasOwnProperty(r) ? e[t] = e[r] : t === "light" ? e.light = rs(e.main, o) : t === "dark" && (e.dark = ts(e.main, i)));
}
function ms(e = "light") {
  return e === "dark" ? {
    main: Ne[200],
    light: Ne[50],
    dark: Ne[400]
  } : {
    main: Ne[700],
    light: Ne[400],
    dark: Ne[800]
  };
}
function hs(e = "light") {
  return e === "dark" ? {
    main: Me[200],
    light: Me[50],
    dark: Me[400]
  } : {
    main: Me[500],
    light: Me[300],
    dark: Me[700]
  };
}
function ys(e = "light") {
  return e === "dark" ? {
    main: De[500],
    light: De[300],
    dark: De[700]
  } : {
    main: De[700],
    light: De[400],
    dark: De[800]
  };
}
function gs(e = "light") {
  return e === "dark" ? {
    main: Fe[400],
    light: Fe[300],
    dark: Fe[700]
  } : {
    main: Fe[700],
    light: Fe[500],
    dark: Fe[900]
  };
}
function vs(e = "light") {
  return e === "dark" ? {
    main: Le[400],
    light: Le[300],
    dark: Le[700]
  } : {
    main: Le[800],
    light: Le[500],
    dark: Le[900]
  };
}
function bs(e = "light") {
  return e === "dark" ? {
    main: Je[400],
    light: Je[300],
    dark: Je[700]
  } : {
    main: "#ed6c02",
    // closest to orange[800] that pass 3:1.
    light: Je[500],
    dark: Je[900]
  };
}
function Es(e) {
  const {
    mode: t = "light",
    contrastThreshold: r = 3,
    tonalOffset: n = 0.2
  } = e, o = Se(e, ps), i = e.primary || ms(t), s = e.secondary || hs(t), c = e.error || ys(t), u = e.info || gs(t), l = e.success || vs(t), f = e.warning || bs(t);
  function p(h) {
    const m = Wr(h, Nt.text.primary) >= r ? Nt.text.primary : Br.text.primary;
    if (process.env.NODE_ENV !== "production") {
      const O = Wr(h, m);
      O < 3 && console.error([`MUI: The contrast ratio of ${O}:1 for ${m} on ${h}`, "falls below the WCAG recommended absolute minimum contrast ratio of 3:1.", "https://www.w3.org/TR/2008/REC-WCAG20-20081211/#visual-audio-contrast-contrast"].join(`
`));
    }
    return m;
  }
  const d = ({
    color: h,
    name: m,
    mainShade: O = 500,
    lightShade: _ = 300,
    darkShade: R = 700
  }) => {
    if (h = Z({}, h), !h.main && h[O] && (h.main = h[O]), !h.hasOwnProperty("main"))
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The color${m ? ` (${m})` : ""} provided to augmentColor(color) is invalid.
The color object needs to have a \`main\` property or a \`${O}\` property.` : ze(11, m ? ` (${m})` : "", O));
    if (typeof h.main != "string")
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The color${m ? ` (${m})` : ""} provided to augmentColor(color) is invalid.
\`color.main\` should be a string, but \`${JSON.stringify(h.main)}\` was provided instead.

Did you intend to use one of the following approaches?

import { green } from "@mui/material/colors";

const theme1 = createTheme({ palette: {
  primary: green,
} });

const theme2 = createTheme({ palette: {
  primary: { main: green[500] },
} });` : ze(12, m ? ` (${m})` : "", JSON.stringify(h.main)));
    return Ur(h, "light", _, n), Ur(h, "dark", R, n), h.contrastText || (h.contrastText = p(h.main)), h;
  }, S = {
    dark: Nt,
    light: Br
  };
  return process.env.NODE_ENV !== "production" && (S[t] || console.error(`MUI: The palette mode \`${t}\` is not supported.`)), Re(Z({
    // A collection of common colors.
    common: Z({}, et),
    // prevent mutable object.
    // The palette mode, can be light or dark.
    mode: t,
    // The colors used to represent primary interface elements for a user.
    primary: d({
      color: i,
      name: "primary"
    }),
    // The colors used to represent secondary interface elements for a user.
    secondary: d({
      color: s,
      name: "secondary",
      mainShade: "A400",
      lightShade: "A200",
      darkShade: "A700"
    }),
    // The colors used to represent interface elements that the user should be made aware of.
    error: d({
      color: c,
      name: "error"
    }),
    // The colors used to represent potentially dangerous actions or important messages.
    warning: d({
      color: f,
      name: "warning"
    }),
    // The colors used to present information to the user that is neutral and not necessarily important.
    info: d({
      color: u,
      name: "info"
    }),
    // The colors used to indicate the successful completion of an action that user triggered.
    success: d({
      color: l,
      name: "success"
    }),
    // The grey colors.
    grey: ss,
    // Used by `getContrastText()` to maximize the contrast between
    // the background and the text.
    contrastThreshold: r,
    // Takes a background color and returns the text color that maximizes the contrast.
    getContrastText: p,
    // Generate a rich color object.
    augmentColor: d,
    // Used by the functions below to shift a color's luminance by approximately
    // two indexes within its tonal palette.
    // E.g., shift from Red 500 to Red 300 or Red 700.
    tonalOffset: n
  }, S[t]), o);
}
const Ss = ["fontFamily", "fontSize", "fontWeightLight", "fontWeightRegular", "fontWeightMedium", "fontWeightBold", "htmlFontSize", "allVariants", "pxToRem"];
function xs(e) {
  return Math.round(e * 1e5) / 1e5;
}
const zr = {
  textTransform: "uppercase"
}, Yr = '"Roboto", "Helvetica", "Arial", sans-serif';
function Ts(e, t) {
  const r = typeof t == "function" ? t(e) : t, {
    fontFamily: n = Yr,
    // The default font size of the Material Specification.
    fontSize: o = 14,
    // px
    fontWeightLight: i = 300,
    fontWeightRegular: s = 400,
    fontWeightMedium: c = 500,
    fontWeightBold: u = 700,
    // Tell MUI what's the font-size on the html element.
    // 16px is the default font-size used by browsers.
    htmlFontSize: l = 16,
    // Apply the CSS properties to all the variants.
    allVariants: f,
    pxToRem: p
  } = r, d = Se(r, Ss);
  process.env.NODE_ENV !== "production" && (typeof o != "number" && console.error("MUI: `fontSize` is required to be a number."), typeof l != "number" && console.error("MUI: `htmlFontSize` is required to be a number."));
  const S = o / 14, x = p || ((O) => `${O / l * S}rem`), h = (O, _, R, U, g) => Z({
    fontFamily: n,
    fontWeight: O,
    fontSize: x(_),
    // Unitless following https://meyerweb.com/eric/thoughts/2006/02/08/unitless-line-heights/
    lineHeight: R
  }, n === Yr ? {
    letterSpacing: `${xs(U / _)}em`
  } : {}, g, f), m = {
    h1: h(i, 96, 1.167, -1.5),
    h2: h(i, 60, 1.2, -0.5),
    h3: h(s, 48, 1.167, 0),
    h4: h(s, 34, 1.235, 0.25),
    h5: h(s, 24, 1.334, 0),
    h6: h(c, 20, 1.6, 0.15),
    subtitle1: h(s, 16, 1.75, 0.15),
    subtitle2: h(c, 14, 1.57, 0.1),
    body1: h(s, 16, 1.5, 0.15),
    body2: h(s, 14, 1.43, 0.15),
    button: h(c, 14, 1.75, 0.4, zr),
    caption: h(s, 12, 1.66, 0.4),
    overline: h(s, 12, 2.66, 1, zr),
    inherit: {
      fontFamily: "inherit",
      fontWeight: "inherit",
      fontSize: "inherit",
      lineHeight: "inherit",
      letterSpacing: "inherit"
    }
  };
  return Re(Z({
    htmlFontSize: l,
    pxToRem: x,
    fontFamily: n,
    fontSize: o,
    fontWeightLight: i,
    fontWeightRegular: s,
    fontWeightMedium: c,
    fontWeightBold: u
  }, m), d, {
    clone: !1
    // No need to clone deep
  });
}
const _s = 0.2, ws = 0.14, Os = 0.12;
function Q(...e) {
  return [`${e[0]}px ${e[1]}px ${e[2]}px ${e[3]}px rgba(0,0,0,${_s})`, `${e[4]}px ${e[5]}px ${e[6]}px ${e[7]}px rgba(0,0,0,${ws})`, `${e[8]}px ${e[9]}px ${e[10]}px ${e[11]}px rgba(0,0,0,${Os})`].join(",");
}
const Rs = ["none", Q(0, 2, 1, -1, 0, 1, 1, 0, 0, 1, 3, 0), Q(0, 3, 1, -2, 0, 2, 2, 0, 0, 1, 5, 0), Q(0, 3, 3, -2, 0, 3, 4, 0, 0, 1, 8, 0), Q(0, 2, 4, -1, 0, 4, 5, 0, 0, 1, 10, 0), Q(0, 3, 5, -1, 0, 5, 8, 0, 0, 1, 14, 0), Q(0, 3, 5, -1, 0, 6, 10, 0, 0, 1, 18, 0), Q(0, 4, 5, -2, 0, 7, 10, 1, 0, 2, 16, 1), Q(0, 5, 5, -3, 0, 8, 10, 1, 0, 3, 14, 2), Q(0, 5, 6, -3, 0, 9, 12, 1, 0, 3, 16, 2), Q(0, 6, 6, -3, 0, 10, 14, 1, 0, 4, 18, 3), Q(0, 6, 7, -4, 0, 11, 15, 1, 0, 4, 20, 3), Q(0, 7, 8, -4, 0, 12, 17, 2, 0, 5, 22, 4), Q(0, 7, 8, -4, 0, 13, 19, 2, 0, 5, 24, 4), Q(0, 7, 9, -4, 0, 14, 21, 2, 0, 5, 26, 4), Q(0, 8, 9, -5, 0, 15, 22, 2, 0, 6, 28, 5), Q(0, 8, 10, -5, 0, 16, 24, 2, 0, 6, 30, 5), Q(0, 8, 11, -5, 0, 17, 26, 2, 0, 6, 32, 5), Q(0, 9, 11, -5, 0, 18, 28, 2, 0, 7, 34, 6), Q(0, 9, 12, -6, 0, 19, 29, 2, 0, 7, 36, 6), Q(0, 10, 13, -6, 0, 20, 31, 3, 0, 8, 38, 7), Q(0, 10, 13, -6, 0, 21, 33, 3, 0, 8, 40, 7), Q(0, 10, 14, -6, 0, 22, 35, 3, 0, 8, 42, 7), Q(0, 11, 14, -7, 0, 23, 36, 3, 0, 9, 44, 8), Q(0, 11, 15, -7, 0, 24, 38, 3, 0, 9, 46, 8)], Cs = Rs, Ps = ["duration", "easing", "delay"], $s = {
  // This is the most common easing curve.
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  // Objects enter the screen at full velocity from off-screen and
  // slowly decelerate to a resting point.
  easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
  // Objects leave the screen at full velocity. They do not decelerate when off-screen.
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  // The sharp curve is used by objects that may return to the screen at any time.
  sharp: "cubic-bezier(0.4, 0, 0.6, 1)"
}, Is = {
  shortest: 150,
  shorter: 200,
  short: 250,
  // most basic recommended timing
  standard: 300,
  // this is to be used in complex animations
  complex: 375,
  // recommended when something is entering screen
  enteringScreen: 225,
  // recommended when something is leaving screen
  leavingScreen: 195
};
function Vr(e) {
  return `${Math.round(e)}ms`;
}
function As(e) {
  if (!e)
    return 0;
  const t = e / 36;
  return Math.round((4 + 15 * t ** 0.25 + t / 5) * 10);
}
function ks(e) {
  const t = Z({}, $s, e.easing), r = Z({}, Is, e.duration);
  return Z({
    getAutoHeightDuration: As,
    create: (o = ["all"], i = {}) => {
      const {
        duration: s = r.standard,
        easing: c = t.easeInOut,
        delay: u = 0
      } = i, l = Se(i, Ps);
      if (process.env.NODE_ENV !== "production") {
        const f = (d) => typeof d == "string", p = (d) => !isNaN(parseFloat(d));
        !f(o) && !Array.isArray(o) && console.error('MUI: Argument "props" must be a string or Array.'), !p(s) && !f(s) && console.error(`MUI: Argument "duration" must be a number or a string but found ${s}.`), f(c) || console.error('MUI: Argument "easing" must be a string.'), !p(u) && !f(u) && console.error('MUI: Argument "delay" must be a number or a string.'), Object.keys(l).length !== 0 && console.error(`MUI: Unrecognized argument(s) [${Object.keys(l).join(",")}].`);
      }
      return (Array.isArray(o) ? o : [o]).map((f) => `${f} ${typeof s == "string" ? s : Vr(s)} ${c} ${typeof u == "string" ? u : Vr(u)}`).join(",");
    }
  }, e, {
    easing: t,
    duration: r
  });
}
const js = {
  mobileStepper: 1e3,
  fab: 1050,
  speedDial: 1050,
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500
}, Ms = js, Ds = ["breakpoints", "mixins", "spacing", "palette", "transitions", "typography", "shape"];
function Ns(e = {}, ...t) {
  const {
    mixins: r = {},
    palette: n = {},
    transitions: o = {},
    typography: i = {}
  } = e, s = Se(e, Ds);
  if (e.vars)
    throw new Error(process.env.NODE_ENV !== "production" ? "MUI: `vars` is a private field used for CSS variables support.\nPlease use another name." : ze(18));
  const c = Es(n), u = mn(e);
  let l = Re(u, {
    mixins: ns(u.breakpoints, r),
    palette: c,
    // Don't use [...shadows] until you've verified its transpiled code is not invoking the iterator protocol.
    shadows: Cs.slice(),
    typography: Ts(c, i),
    transitions: ks(o),
    zIndex: Z({}, Ms)
  });
  if (l = Re(l, s), l = t.reduce((f, p) => Re(f, p), l), process.env.NODE_ENV !== "production") {
    const f = ["active", "checked", "completed", "disabled", "error", "expanded", "focused", "focusVisible", "required", "selected"], p = (d, S) => {
      let x;
      for (x in d) {
        const h = d[x];
        if (f.indexOf(x) !== -1 && Object.keys(h).length > 0) {
          if (process.env.NODE_ENV !== "production") {
            const m = Yo("", x);
            console.error([`MUI: The \`${S}\` component increases the CSS specificity of the \`${x}\` internal state.`, "You can not override it like this: ", JSON.stringify(d, null, 2), "", `Instead, you need to use the '&.${m}' syntax:`, JSON.stringify({
              root: {
                [`&.${m}`]: h
              }
            }, null, 2), "", "https://mui.com/r/state-classes-guide"].join(`
`));
          }
          d[x] = {};
        }
      }
    };
    Object.keys(l.components).forEach((d) => {
      const S = l.components[d].styleOverrides;
      S && d.indexOf("Mui") === 0 && p(S, d);
    });
  }
  return l.unstable_sxConfig = Z({}, Jt, s == null ? void 0 : s.unstable_sxConfig), l.unstable_sx = function(p) {
    return Xt({
      sx: p,
      theme: this
    });
  }, l;
}
const Fs = Ns(), Ls = Fs, Ws = (e) => at(e) && e !== "classes", Bs = Qi({
  defaultTheme: Ls,
  rootShouldForwardProp: Ws
}), Pe = Bs, nc = Pe(({ color: e = "primary", ...t }) => /* @__PURE__ */ H(eo, { color: e, ...t }))``, oc = Pe((e) => /* @__PURE__ */ H(to, { ...e }))``, Ze = /^[a-z0-9]+(-[a-z0-9]+)*$/, Tt = (e, t, r, n = "") => {
  const o = e.split(":");
  if (e.slice(0, 1) === "@") {
    if (o.length < 2 || o.length > 3)
      return null;
    n = o.shift().slice(1);
  }
  if (o.length > 3 || !o.length)
    return null;
  if (o.length > 1) {
    const c = o.pop(), u = o.pop(), l = {
      provider: o.length > 0 ? o[0] : n,
      prefix: u,
      name: c
    };
    return t && !ct(l) ? null : l;
  }
  const i = o[0], s = i.split("-");
  if (s.length > 1) {
    const c = {
      provider: n,
      prefix: s.shift(),
      name: s.join("-")
    };
    return t && !ct(c) ? null : c;
  }
  if (r && n === "") {
    const c = {
      provider: n,
      prefix: "",
      name: i
    };
    return t && !ct(c, r) ? null : c;
  }
  return null;
}, ct = (e, t) => e ? !!((e.provider === "" || e.provider.match(Ze)) && (t && e.prefix === "" || e.prefix.match(Ze)) && e.name.match(Ze)) : !1, gn = Object.freeze(
  {
    left: 0,
    top: 0,
    width: 16,
    height: 16
  }
), mt = Object.freeze({
  rotate: 0,
  vFlip: !1,
  hFlip: !1
}), er = Object.freeze({
  ...gn,
  ...mt
}), Wt = Object.freeze({
  ...er,
  body: "",
  hidden: !1
});
function Us(e, t) {
  const r = {};
  !e.hFlip != !t.hFlip && (r.hFlip = !0), !e.vFlip != !t.vFlip && (r.vFlip = !0);
  const n = ((e.rotate || 0) + (t.rotate || 0)) % 4;
  return n && (r.rotate = n), r;
}
function qr(e, t) {
  const r = Us(e, t);
  for (const n in Wt)
    n in mt ? n in e && !(n in r) && (r[n] = mt[n]) : n in t ? r[n] = t[n] : n in e && (r[n] = e[n]);
  return r;
}
function zs(e, t) {
  const r = e.icons, n = e.aliases || /* @__PURE__ */ Object.create(null), o = /* @__PURE__ */ Object.create(null);
  function i(s) {
    if (r[s])
      return o[s] = [];
    if (!(s in o)) {
      o[s] = null;
      const c = n[s] && n[s].parent, u = c && i(c);
      u && (o[s] = [c].concat(u));
    }
    return o[s];
  }
  return (t || Object.keys(r).concat(Object.keys(n))).forEach(i), o;
}
function Ys(e, t, r) {
  const n = e.icons, o = e.aliases || /* @__PURE__ */ Object.create(null);
  let i = {};
  function s(c) {
    i = qr(
      n[c] || o[c],
      i
    );
  }
  return s(t), r.forEach(s), qr(e, i);
}
function vn(e, t) {
  const r = [];
  if (typeof e != "object" || typeof e.icons != "object")
    return r;
  e.not_found instanceof Array && e.not_found.forEach((o) => {
    t(o, null), r.push(o);
  });
  const n = zs(e);
  for (const o in n) {
    const i = n[o];
    i && (t(o, Ys(e, o, i)), r.push(o));
  }
  return r;
}
const Vs = {
  provider: "",
  aliases: {},
  not_found: {},
  ...gn
};
function Ft(e, t) {
  for (const r in t)
    if (r in e && typeof e[r] != typeof t[r])
      return !1;
  return !0;
}
function bn(e) {
  if (typeof e != "object" || e === null)
    return null;
  const t = e;
  if (typeof t.prefix != "string" || !e.icons || typeof e.icons != "object" || !Ft(e, Vs))
    return null;
  const r = t.icons;
  for (const o in r) {
    const i = r[o];
    if (!o.match(Ze) || typeof i.body != "string" || !Ft(
      i,
      Wt
    ))
      return null;
  }
  const n = t.aliases || /* @__PURE__ */ Object.create(null);
  for (const o in n) {
    const i = n[o], s = i.parent;
    if (!o.match(Ze) || typeof s != "string" || !r[s] && !n[s] || !Ft(
      i,
      Wt
    ))
      return null;
  }
  return t;
}
const Kr = /* @__PURE__ */ Object.create(null);
function qs(e, t) {
  return {
    provider: e,
    prefix: t,
    icons: /* @__PURE__ */ Object.create(null),
    missing: /* @__PURE__ */ new Set()
  };
}
function Ae(e, t) {
  const r = Kr[e] || (Kr[e] = /* @__PURE__ */ Object.create(null));
  return r[t] || (r[t] = qs(e, t));
}
function tr(e, t) {
  return bn(t) ? vn(t, (r, n) => {
    n ? e.icons[r] = n : e.missing.add(r);
  }) : [];
}
function Ks(e, t, r) {
  try {
    if (typeof r.body == "string")
      return e.icons[t] = { ...r }, !0;
  } catch {
  }
  return !1;
}
let tt = !1;
function En(e) {
  return typeof e == "boolean" && (tt = e), tt;
}
function Gs(e) {
  const t = typeof e == "string" ? Tt(e, !0, tt) : e;
  if (t) {
    const r = Ae(t.provider, t.prefix), n = t.name;
    return r.icons[n] || (r.missing.has(n) ? null : void 0);
  }
}
function Hs(e, t) {
  const r = Tt(e, !0, tt);
  if (!r)
    return !1;
  const n = Ae(r.provider, r.prefix);
  return Ks(n, r.name, t);
}
function Js(e, t) {
  if (typeof e != "object")
    return !1;
  if (typeof t != "string" && (t = e.provider || ""), tt && !t && !e.prefix) {
    let o = !1;
    return bn(e) && (e.prefix = "", vn(e, (i, s) => {
      s && Hs(i, s) && (o = !0);
    })), o;
  }
  const r = e.prefix;
  if (!ct({
    provider: t,
    prefix: r,
    name: "a"
  }))
    return !1;
  const n = Ae(t, r);
  return !!tr(n, e);
}
const Sn = Object.freeze({
  width: null,
  height: null
}), xn = Object.freeze({
  ...Sn,
  ...mt
}), Xs = /(-?[0-9.]*[0-9]+[0-9.]*)/g, Qs = /^-?[0-9.]*[0-9]+[0-9.]*$/g;
function Gr(e, t, r) {
  if (t === 1)
    return e;
  if (r = r || 100, typeof e == "number")
    return Math.ceil(e * t * r) / r;
  if (typeof e != "string")
    return e;
  const n = e.split(Xs);
  if (n === null || !n.length)
    return e;
  const o = [];
  let i = n.shift(), s = Qs.test(i);
  for (; ; ) {
    if (s) {
      const c = parseFloat(i);
      isNaN(c) ? o.push(i) : o.push(Math.ceil(c * t * r) / r);
    } else
      o.push(i);
    if (i = n.shift(), i === void 0)
      return o.join("");
    s = !s;
  }
}
const Zs = (e) => e === "unset" || e === "undefined" || e === "none";
function ea(e, t) {
  const r = {
    ...er,
    ...e
  }, n = {
    ...xn,
    ...t
  }, o = {
    left: r.left,
    top: r.top,
    width: r.width,
    height: r.height
  };
  let i = r.body;
  [r, n].forEach((x) => {
    const h = [], m = x.hFlip, O = x.vFlip;
    let _ = x.rotate;
    m ? O ? _ += 2 : (h.push(
      "translate(" + (o.width + o.left).toString() + " " + (0 - o.top).toString() + ")"
    ), h.push("scale(-1 1)"), o.top = o.left = 0) : O && (h.push(
      "translate(" + (0 - o.left).toString() + " " + (o.height + o.top).toString() + ")"
    ), h.push("scale(1 -1)"), o.top = o.left = 0);
    let R;
    switch (_ < 0 && (_ -= Math.floor(_ / 4) * 4), _ = _ % 4, _) {
      case 1:
        R = o.height / 2 + o.top, h.unshift(
          "rotate(90 " + R.toString() + " " + R.toString() + ")"
        );
        break;
      case 2:
        h.unshift(
          "rotate(180 " + (o.width / 2 + o.left).toString() + " " + (o.height / 2 + o.top).toString() + ")"
        );
        break;
      case 3:
        R = o.width / 2 + o.left, h.unshift(
          "rotate(-90 " + R.toString() + " " + R.toString() + ")"
        );
        break;
    }
    _ % 2 === 1 && (o.left !== o.top && (R = o.left, o.left = o.top, o.top = R), o.width !== o.height && (R = o.width, o.width = o.height, o.height = R)), h.length && (i = '<g transform="' + h.join(" ") + '">' + i + "</g>");
  });
  const s = n.width, c = n.height, u = o.width, l = o.height;
  let f, p;
  s === null ? (p = c === null ? "1em" : c === "auto" ? l : c, f = Gr(p, u / l)) : (f = s === "auto" ? u : s, p = c === null ? Gr(f, l / u) : c === "auto" ? l : c);
  const d = {}, S = (x, h) => {
    Zs(h) || (d[x] = h.toString());
  };
  return S("width", f), S("height", p), d.viewBox = o.left.toString() + " " + o.top.toString() + " " + u.toString() + " " + l.toString(), {
    attributes: d,
    body: i
  };
}
const ta = /\sid="(\S+)"/g, ra = "IconifyId" + Date.now().toString(16) + (Math.random() * 16777216 | 0).toString(16);
let na = 0;
function oa(e, t = ra) {
  const r = [];
  let n;
  for (; n = ta.exec(e); )
    r.push(n[1]);
  if (!r.length)
    return e;
  const o = "suffix" + (Math.random() * 16777216 | Date.now()).toString(16);
  return r.forEach((i) => {
    const s = typeof t == "function" ? t(i) : t + (na++).toString(), c = i.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    e = e.replace(
      new RegExp('([#;"])(' + c + ')([")]|\\.[a-z])', "g"),
      "$1" + s + o + "$3"
    );
  }), e = e.replace(new RegExp(o, "g"), ""), e;
}
const Bt = /* @__PURE__ */ Object.create(null);
function ia(e, t) {
  Bt[e] = t;
}
function Ut(e) {
  return Bt[e] || Bt[""];
}
function rr(e) {
  let t;
  if (typeof e.resources == "string")
    t = [e.resources];
  else if (t = e.resources, !(t instanceof Array) || !t.length)
    return null;
  return {
    resources: t,
    path: e.path || "/",
    maxURL: e.maxURL || 500,
    rotate: e.rotate || 750,
    timeout: e.timeout || 5e3,
    random: e.random === !0,
    index: e.index || 0,
    dataAfterTimeout: e.dataAfterTimeout !== !1
  };
}
const nr = /* @__PURE__ */ Object.create(null), Xe = [
  "https://api.simplesvg.com",
  "https://api.unisvg.com"
], ut = [];
for (; Xe.length > 0; )
  Xe.length === 1 || Math.random() > 0.5 ? ut.push(Xe.shift()) : ut.push(Xe.pop());
nr[""] = rr({
  resources: ["https://api.iconify.design"].concat(ut)
});
function sa(e, t) {
  const r = rr(t);
  return r === null ? !1 : (nr[e] = r, !0);
}
function or(e) {
  return nr[e];
}
const aa = () => {
  let e;
  try {
    if (e = fetch, typeof e == "function")
      return e;
  } catch {
  }
};
let Hr = aa();
function ca(e, t) {
  const r = or(e);
  if (!r)
    return 0;
  let n;
  if (!r.maxURL)
    n = 0;
  else {
    let o = 0;
    r.resources.forEach((s) => {
      o = Math.max(o, s.length);
    });
    const i = t + ".json?icons=";
    n = r.maxURL - o - r.path.length - i.length;
  }
  return n;
}
function ua(e) {
  return e === 404;
}
const la = (e, t, r) => {
  const n = [], o = ca(e, t), i = "icons";
  let s = {
    type: i,
    provider: e,
    prefix: t,
    icons: []
  }, c = 0;
  return r.forEach((u, l) => {
    c += u.length + 1, c >= o && l > 0 && (n.push(s), s = {
      type: i,
      provider: e,
      prefix: t,
      icons: []
    }, c = u.length), s.icons.push(u);
  }), n.push(s), n;
};
function fa(e) {
  if (typeof e == "string") {
    const t = or(e);
    if (t)
      return t.path;
  }
  return "/";
}
const da = (e, t, r) => {
  if (!Hr) {
    r("abort", 424);
    return;
  }
  let n = fa(t.provider);
  switch (t.type) {
    case "icons": {
      const i = t.prefix, c = t.icons.join(","), u = new URLSearchParams({
        icons: c
      });
      n += i + ".json?" + u.toString();
      break;
    }
    case "custom": {
      const i = t.uri;
      n += i.slice(0, 1) === "/" ? i.slice(1) : i;
      break;
    }
    default:
      r("abort", 400);
      return;
  }
  let o = 503;
  Hr(e + n).then((i) => {
    const s = i.status;
    if (s !== 200) {
      setTimeout(() => {
        r(ua(s) ? "abort" : "next", s);
      });
      return;
    }
    return o = 501, i.json();
  }).then((i) => {
    if (typeof i != "object" || i === null) {
      setTimeout(() => {
        i === 404 ? r("abort", i) : r("next", o);
      });
      return;
    }
    setTimeout(() => {
      r("success", i);
    });
  }).catch(() => {
    r("next", o);
  });
}, pa = {
  prepare: la,
  send: da
};
function ma(e) {
  const t = {
    loaded: [],
    missing: [],
    pending: []
  }, r = /* @__PURE__ */ Object.create(null);
  e.sort((o, i) => o.provider !== i.provider ? o.provider.localeCompare(i.provider) : o.prefix !== i.prefix ? o.prefix.localeCompare(i.prefix) : o.name.localeCompare(i.name));
  let n = {
    provider: "",
    prefix: "",
    name: ""
  };
  return e.forEach((o) => {
    if (n.name === o.name && n.prefix === o.prefix && n.provider === o.provider)
      return;
    n = o;
    const i = o.provider, s = o.prefix, c = o.name, u = r[i] || (r[i] = /* @__PURE__ */ Object.create(null)), l = u[s] || (u[s] = Ae(i, s));
    let f;
    c in l.icons ? f = t.loaded : s === "" || l.missing.has(c) ? f = t.missing : f = t.pending;
    const p = {
      provider: i,
      prefix: s,
      name: c
    };
    f.push(p);
  }), t;
}
function Tn(e, t) {
  e.forEach((r) => {
    const n = r.loaderCallbacks;
    n && (r.loaderCallbacks = n.filter((o) => o.id !== t));
  });
}
function ha(e) {
  e.pendingCallbacksFlag || (e.pendingCallbacksFlag = !0, setTimeout(() => {
    e.pendingCallbacksFlag = !1;
    const t = e.loaderCallbacks ? e.loaderCallbacks.slice(0) : [];
    if (!t.length)
      return;
    let r = !1;
    const n = e.provider, o = e.prefix;
    t.forEach((i) => {
      const s = i.icons, c = s.pending.length;
      s.pending = s.pending.filter((u) => {
        if (u.prefix !== o)
          return !0;
        const l = u.name;
        if (e.icons[l])
          s.loaded.push({
            provider: n,
            prefix: o,
            name: l
          });
        else if (e.missing.has(l))
          s.missing.push({
            provider: n,
            prefix: o,
            name: l
          });
        else
          return r = !0, !0;
        return !1;
      }), s.pending.length !== c && (r || Tn([e], i.id), i.callback(
        s.loaded.slice(0),
        s.missing.slice(0),
        s.pending.slice(0),
        i.abort
      ));
    });
  }));
}
let ya = 0;
function ga(e, t, r) {
  const n = ya++, o = Tn.bind(null, r, n);
  if (!t.pending.length)
    return o;
  const i = {
    id: n,
    icons: t,
    callback: e,
    abort: o
  };
  return r.forEach((s) => {
    (s.loaderCallbacks || (s.loaderCallbacks = [])).push(i);
  }), o;
}
function va(e, t = !0, r = !1) {
  const n = [];
  return e.forEach((o) => {
    const i = typeof o == "string" ? Tt(o, t, r) : o;
    i && n.push(i);
  }), n;
}
var ba = {
  resources: [],
  index: 0,
  timeout: 2e3,
  rotate: 750,
  random: !1,
  dataAfterTimeout: !1
};
function Ea(e, t, r, n) {
  const o = e.resources.length, i = e.random ? Math.floor(Math.random() * o) : e.index;
  let s;
  if (e.random) {
    let I = e.resources.slice(0);
    for (s = []; I.length > 1; ) {
      const ee = Math.floor(Math.random() * I.length);
      s.push(I[ee]), I = I.slice(0, ee).concat(I.slice(ee + 1));
    }
    s = s.concat(I);
  } else
    s = e.resources.slice(i).concat(e.resources.slice(0, i));
  const c = Date.now();
  let u = "pending", l = 0, f, p = null, d = [], S = [];
  typeof n == "function" && S.push(n);
  function x() {
    p && (clearTimeout(p), p = null);
  }
  function h() {
    u === "pending" && (u = "aborted"), x(), d.forEach((I) => {
      I.status === "pending" && (I.status = "aborted");
    }), d = [];
  }
  function m(I, ee) {
    ee && (S = []), typeof I == "function" && S.push(I);
  }
  function O() {
    return {
      startTime: c,
      payload: t,
      status: u,
      queriesSent: l,
      queriesPending: d.length,
      subscribe: m,
      abort: h
    };
  }
  function _() {
    u = "failed", S.forEach((I) => {
      I(void 0, f);
    });
  }
  function R() {
    d.forEach((I) => {
      I.status === "pending" && (I.status = "aborted");
    }), d = [];
  }
  function U(I, ee, ce) {
    const M = ee !== "success";
    switch (d = d.filter((J) => J !== I), u) {
      case "pending":
        break;
      case "failed":
        if (M || !e.dataAfterTimeout)
          return;
        break;
      default:
        return;
    }
    if (ee === "abort") {
      f = ce, _();
      return;
    }
    if (M) {
      f = ce, d.length || (s.length ? g() : _());
      return;
    }
    if (x(), R(), !e.random) {
      const J = e.resources.indexOf(I.resource);
      J !== -1 && J !== e.index && (e.index = J);
    }
    u = "completed", S.forEach((J) => {
      J(ce);
    });
  }
  function g() {
    if (u !== "pending")
      return;
    x();
    const I = s.shift();
    if (I === void 0) {
      if (d.length) {
        p = setTimeout(() => {
          x(), u === "pending" && (R(), _());
        }, e.timeout);
        return;
      }
      _();
      return;
    }
    const ee = {
      status: "pending",
      resource: I,
      callback: (ce, M) => {
        U(ee, ce, M);
      }
    };
    d.push(ee), l++, p = setTimeout(g, e.rotate), r(I, t, ee.callback);
  }
  return setTimeout(g), O;
}
function _n(e) {
  const t = {
    ...ba,
    ...e
  };
  let r = [];
  function n() {
    r = r.filter((c) => c().status === "pending");
  }
  function o(c, u, l) {
    const f = Ea(
      t,
      c,
      u,
      (p, d) => {
        n(), l && l(p, d);
      }
    );
    return r.push(f), f;
  }
  function i(c) {
    return r.find((u) => c(u)) || null;
  }
  return {
    query: o,
    find: i,
    setIndex: (c) => {
      t.index = c;
    },
    getIndex: () => t.index,
    cleanup: n
  };
}
function Jr() {
}
const Lt = /* @__PURE__ */ Object.create(null);
function Sa(e) {
  if (!Lt[e]) {
    const t = or(e);
    if (!t)
      return;
    const r = _n(t), n = {
      config: t,
      redundancy: r
    };
    Lt[e] = n;
  }
  return Lt[e];
}
function xa(e, t, r) {
  let n, o;
  if (typeof e == "string") {
    const i = Ut(e);
    if (!i)
      return r(void 0, 424), Jr;
    o = i.send;
    const s = Sa(e);
    s && (n = s.redundancy);
  } else {
    const i = rr(e);
    if (i) {
      n = _n(i);
      const s = e.resources ? e.resources[0] : "", c = Ut(s);
      c && (o = c.send);
    }
  }
  return !n || !o ? (r(void 0, 424), Jr) : n.query(t, o, r)().abort;
}
const Xr = "iconify2", rt = "iconify", wn = rt + "-count", Qr = rt + "-version", On = 36e5, Ta = 168;
function zt(e, t) {
  try {
    return e.getItem(t);
  } catch {
  }
}
function ir(e, t, r) {
  try {
    return e.setItem(t, r), !0;
  } catch {
  }
}
function Zr(e, t) {
  try {
    e.removeItem(t);
  } catch {
  }
}
function Yt(e, t) {
  return ir(e, wn, t.toString());
}
function Vt(e) {
  return parseInt(zt(e, wn)) || 0;
}
const _t = {
  local: !0,
  session: !0
}, Rn = {
  local: /* @__PURE__ */ new Set(),
  session: /* @__PURE__ */ new Set()
};
let sr = !1;
function _a(e) {
  sr = e;
}
let st = typeof window > "u" ? {} : window;
function Cn(e) {
  const t = e + "Storage";
  try {
    if (st && st[t] && typeof st[t].length == "number")
      return st[t];
  } catch {
  }
  _t[e] = !1;
}
function Pn(e, t) {
  const r = Cn(e);
  if (!r)
    return;
  const n = zt(r, Qr);
  if (n !== Xr) {
    if (n) {
      const c = Vt(r);
      for (let u = 0; u < c; u++)
        Zr(r, rt + u.toString());
    }
    ir(r, Qr, Xr), Yt(r, 0);
    return;
  }
  const o = Math.floor(Date.now() / On) - Ta, i = (c) => {
    const u = rt + c.toString(), l = zt(r, u);
    if (typeof l == "string") {
      try {
        const f = JSON.parse(l);
        if (typeof f == "object" && typeof f.cached == "number" && f.cached > o && typeof f.provider == "string" && typeof f.data == "object" && typeof f.data.prefix == "string" && t(f, c))
          return !0;
      } catch {
      }
      Zr(r, u);
    }
  };
  let s = Vt(r);
  for (let c = s - 1; c >= 0; c--)
    i(c) || (c === s - 1 ? (s--, Yt(r, s)) : Rn[e].add(c));
}
function $n() {
  if (!sr) {
    _a(!0);
    for (const e in _t)
      Pn(e, (t) => {
        const r = t.data, n = t.provider, o = r.prefix, i = Ae(
          n,
          o
        );
        if (!tr(i, r).length)
          return !1;
        const s = r.lastModified || -1;
        return i.lastModifiedCached = i.lastModifiedCached ? Math.min(i.lastModifiedCached, s) : s, !0;
      });
  }
}
function wa(e, t) {
  const r = e.lastModifiedCached;
  if (r && r >= t)
    return r === t;
  if (e.lastModifiedCached = t, r)
    for (const n in _t)
      Pn(n, (o) => {
        const i = o.data;
        return o.provider !== e.provider || i.prefix !== e.prefix || i.lastModified === t;
      });
  return !0;
}
function Oa(e, t) {
  sr || $n();
  function r(n) {
    let o;
    if (!_t[n] || !(o = Cn(n)))
      return;
    const i = Rn[n];
    let s;
    if (i.size)
      i.delete(s = Array.from(i).shift());
    else if (s = Vt(o), !Yt(o, s + 1))
      return;
    const c = {
      cached: Math.floor(Date.now() / On),
      provider: e.provider,
      data: t
    };
    return ir(
      o,
      rt + s.toString(),
      JSON.stringify(c)
    );
  }
  t.lastModified && !wa(e, t.lastModified) || Object.keys(t.icons).length && (t.not_found && (t = Object.assign({}, t), delete t.not_found), r("local") || r("session"));
}
function en() {
}
function Ra(e) {
  e.iconsLoaderFlag || (e.iconsLoaderFlag = !0, setTimeout(() => {
    e.iconsLoaderFlag = !1, ha(e);
  }));
}
function Ca(e, t) {
  e.iconsToLoad ? e.iconsToLoad = e.iconsToLoad.concat(t).sort() : e.iconsToLoad = t, e.iconsQueueFlag || (e.iconsQueueFlag = !0, setTimeout(() => {
    e.iconsQueueFlag = !1;
    const { provider: r, prefix: n } = e, o = e.iconsToLoad;
    delete e.iconsToLoad;
    let i;
    if (!o || !(i = Ut(r)))
      return;
    i.prepare(r, n, o).forEach((c) => {
      xa(r, c, (u) => {
        if (typeof u != "object")
          c.icons.forEach((l) => {
            e.missing.add(l);
          });
        else
          try {
            const l = tr(
              e,
              u
            );
            if (!l.length)
              return;
            const f = e.pendingIcons;
            f && l.forEach((p) => {
              f.delete(p);
            }), Oa(e, u);
          } catch (l) {
            console.error(l);
          }
        Ra(e);
      });
    });
  }));
}
const Pa = (e, t) => {
  const r = va(e, !0, En()), n = ma(r);
  if (!n.pending.length) {
    let u = !0;
    return t && setTimeout(() => {
      u && t(
        n.loaded,
        n.missing,
        n.pending,
        en
      );
    }), () => {
      u = !1;
    };
  }
  const o = /* @__PURE__ */ Object.create(null), i = [];
  let s, c;
  return n.pending.forEach((u) => {
    const { provider: l, prefix: f } = u;
    if (f === c && l === s)
      return;
    s = l, c = f, i.push(Ae(l, f));
    const p = o[l] || (o[l] = /* @__PURE__ */ Object.create(null));
    p[f] || (p[f] = []);
  }), n.pending.forEach((u) => {
    const { provider: l, prefix: f, name: p } = u, d = Ae(l, f), S = d.pendingIcons || (d.pendingIcons = /* @__PURE__ */ new Set());
    S.has(p) || (S.add(p), o[l][f].push(p));
  }), i.forEach((u) => {
    const { provider: l, prefix: f } = u;
    o[l][f].length && Ca(u, o[l][f]);
  }), t ? ga(t, n, i) : en;
};
function $a(e, t) {
  const r = {
    ...e
  };
  for (const n in t) {
    const o = t[n], i = typeof o;
    n in Sn ? (o === null || o && (i === "string" || i === "number")) && (r[n] = o) : i === typeof r[n] && (r[n] = n === "rotate" ? o % 4 : o);
  }
  return r;
}
const Ia = /[\s,]+/;
function Aa(e, t) {
  t.split(Ia).forEach((r) => {
    switch (r.trim()) {
      case "horizontal":
        e.hFlip = !0;
        break;
      case "vertical":
        e.vFlip = !0;
        break;
    }
  });
}
function ka(e, t = 0) {
  const r = e.replace(/^-?[0-9.]*/, "");
  function n(o) {
    for (; o < 0; )
      o += 4;
    return o % 4;
  }
  if (r === "") {
    const o = parseInt(e);
    return isNaN(o) ? 0 : n(o);
  } else if (r !== e) {
    let o = 0;
    switch (r) {
      case "%":
        o = 25;
        break;
      case "deg":
        o = 90;
    }
    if (o) {
      let i = parseFloat(e.slice(0, e.length - r.length));
      return isNaN(i) ? 0 : (i = i / o, i % 1 === 0 ? n(i) : 0);
    }
  }
  return t;
}
function ja(e, t) {
  let r = e.indexOf("xlink:") === -1 ? "" : ' xmlns:xlink="http://www.w3.org/1999/xlink"';
  for (const n in t)
    r += " " + n + '="' + t[n] + '"';
  return '<svg xmlns="http://www.w3.org/2000/svg"' + r + ">" + e + "</svg>";
}
function Ma(e) {
  return e.replace(/"/g, "'").replace(/%/g, "%25").replace(/#/g, "%23").replace(/</g, "%3C").replace(/>/g, "%3E").replace(/\s+/g, " ");
}
function Da(e) {
  return 'url("data:image/svg+xml,' + Ma(e) + '")';
}
const In = {
  ...xn,
  inline: !1
}, Na = {
  xmlns: "http://www.w3.org/2000/svg",
  xmlnsXlink: "http://www.w3.org/1999/xlink",
  "aria-hidden": !0,
  role: "img"
}, Fa = {
  display: "inline-block"
}, qt = {
  backgroundColor: "currentColor"
}, An = {
  backgroundColor: "transparent"
}, tn = {
  Image: "var(--svg)",
  Repeat: "no-repeat",
  Size: "100% 100%"
}, rn = {
  webkitMask: qt,
  mask: qt,
  background: An
};
for (const e in rn) {
  const t = rn[e];
  for (const r in tn)
    t[e + r] = tn[r];
}
const La = {
  ...In,
  inline: !0
};
function nn(e) {
  return e + (e.match(/^[-0-9.]+$/) ? "px" : "");
}
const Wa = (e, t, r, n) => {
  const o = r ? La : In, i = $a(o, t), s = t.mode || "svg", c = {}, u = t.style || {}, l = {
    ...s === "svg" ? Na : {},
    ref: n
  };
  for (let O in t) {
    const _ = t[O];
    if (_ !== void 0)
      switch (O) {
        case "icon":
        case "style":
        case "children":
        case "onLoad":
        case "mode":
        case "_ref":
        case "_inline":
          break;
        case "inline":
        case "hFlip":
        case "vFlip":
          i[O] = _ === !0 || _ === "true" || _ === 1;
          break;
        case "flip":
          typeof _ == "string" && Aa(i, _);
          break;
        case "color":
          c.color = _;
          break;
        case "rotate":
          typeof _ == "string" ? i[O] = ka(_) : typeof _ == "number" && (i[O] = _);
          break;
        case "ariaHidden":
        case "aria-hidden":
          _ !== !0 && _ !== "true" && delete l["aria-hidden"];
          break;
        default:
          o[O] === void 0 && (l[O] = _);
      }
  }
  const f = ea(e, i), p = f.attributes;
  if (i.inline && (c.verticalAlign = "-0.125em"), s === "svg") {
    l.style = {
      ...c,
      ...u
    }, Object.assign(l, p);
    let O = 0, _ = t.id;
    return typeof _ == "string" && (_ = _.replace(/-/g, "_")), l.dangerouslySetInnerHTML = {
      __html: oa(f.body, _ ? () => _ + "ID" + O++ : "iconifyReact")
    }, xe.createElement("svg", l);
  }
  const { body: d, width: S, height: x } = e, h = s === "mask" || (s === "bg" ? !1 : d.indexOf("currentColor") !== -1), m = ja(d, {
    ...p,
    width: S + "",
    height: x + ""
  });
  return l.style = {
    ...c,
    "--svg": Da(m),
    width: nn(p.width),
    height: nn(p.height),
    ...Fa,
    ...h ? qt : An,
    ...u
  }, xe.createElement("span", l);
};
En(!0);
ia("", pa);
if (typeof document < "u" && typeof window < "u") {
  $n();
  const e = window;
  if (e.IconifyPreload !== void 0) {
    const t = e.IconifyPreload, r = "Invalid IconifyPreload syntax.";
    typeof t == "object" && t !== null && (t instanceof Array ? t : [t]).forEach((n) => {
      try {
        // Check if item is an object and not null/array
        (typeof n != "object" || n === null || n instanceof Array || // Check for 'icons' and 'prefix'
        typeof n.icons != "object" || typeof n.prefix != "string" || // Add icon set
        !Js(n)) && console.error(r);
      } catch {
        console.error(r);
      }
    });
  }
  if (e.IconifyProviders !== void 0) {
    const t = e.IconifyProviders;
    if (typeof t == "object" && t !== null)
      for (let r in t) {
        const n = "IconifyProviders[" + r + "] is invalid.";
        try {
          const o = t[r];
          if (typeof o != "object" || !o || o.resources === void 0)
            continue;
          sa(r, o) || console.error(n);
        } catch {
          console.error(n);
        }
      }
  }
}
class kn extends xe.Component {
  constructor(t) {
    super(t), this.state = {
      // Render placeholder before component is mounted
      icon: null
    };
  }
  /**
   * Abort loading icon
   */
  _abortLoading() {
    this._loading && (this._loading.abort(), this._loading = null);
  }
  /**
   * Update state
   */
  _setData(t) {
    this.state.icon !== t && this.setState({
      icon: t
    });
  }
  /**
   * Check if icon should be loaded
   */
  _checkIcon(t) {
    const r = this.state, n = this.props.icon;
    if (typeof n == "object" && n !== null && typeof n.body == "string") {
      this._icon = "", this._abortLoading(), (t || r.icon === null) && this._setData({
        data: n
      });
      return;
    }
    let o;
    if (typeof n != "string" || (o = Tt(n, !1, !0)) === null) {
      this._abortLoading(), this._setData(null);
      return;
    }
    const i = Gs(o);
    if (!i) {
      (!this._loading || this._loading.name !== n) && (this._abortLoading(), this._icon = "", this._setData(null), i !== null && (this._loading = {
        name: n,
        abort: Pa([o], this._checkIcon.bind(this, !1))
      }));
      return;
    }
    if (this._icon !== n || r.icon === null) {
      this._abortLoading(), this._icon = n;
      const s = ["iconify"];
      o.prefix !== "" && s.push("iconify--" + o.prefix), o.provider !== "" && s.push("iconify--" + o.provider), this._setData({
        data: i,
        classes: s
      }), this.props.onLoad && this.props.onLoad(n);
    }
  }
  /**
   * Component mounted
   */
  componentDidMount() {
    this._checkIcon(!1);
  }
  /**
   * Component updated
   */
  componentDidUpdate(t) {
    t.icon !== this.props.icon && this._checkIcon(!0);
  }
  /**
   * Abort loading
   */
  componentWillUnmount() {
    this._abortLoading();
  }
  /**
   * Render
   */
  render() {
    const t = this.props, r = this.state.icon;
    if (r === null)
      return t.children ? t.children : xe.createElement("span", {});
    let n = t;
    return r.classes && (n = {
      ...t,
      className: (typeof t.className == "string" ? t.className + " " : "") + r.classes.join(" ")
    }), Wa({
      ...er,
      ...r.data
    }, n, t._inline, t._ref);
  }
}
const Ba = xe.forwardRef(function(t, r) {
  const n = {
    ...t,
    _ref: r,
    _inline: !1
  };
  return xe.createElement(kn, n);
});
xe.forwardRef(function(t, r) {
  const n = {
    ...t,
    _ref: r,
    _inline: !0
  };
  return xe.createElement(kn, n);
});
const Ua = Pe((e) => /* @__PURE__ */ H(ro, { variant: e.variant || "contained", ...e, disableRipple: !0, classes: {
  containedPrimary: "normal-case bg-primary-main hover:bg-primary-700 active:bg-primary-dark",
  containedSecondary: "normal-case bg-secondary-main hover:bg-secondary-700 active:bg-secondary-dark",
  disabled: "bg-gray-200 text-gray-400 border-grey-500",
  outlined: `normal-case text-primary-dark ${!e.disabled && "border-primary-main"} hover:bg-primary-500 hover:text-gray-50 hover:border-primary-500`,
  focusVisible: `${e.variant === "contained" && "bg-primary-700 shadow-[0_0_0_3px] shadow-primary-400"} ${e.variant === "outlined" && "bg-primary-100 text-primary-dark"}}`,
  text: "normal-case"
} }))``, ic = Ce((e) => /* @__PURE__ */ H(no, { ...e }))``, sc = Ce((e) => /* @__PURE__ */ H(oo, { ...e }))``, za = Ce((e) => /* @__PURE__ */ H(io, { ...e }))``, ac = Ce((e) => /* @__PURE__ */ H(so, { ...e }))``, cc = Ce((e) => /* @__PURE__ */ H(ao, { ...e }))``, uc = Pe((e) => /* @__PURE__ */ H(co, { ...e, focusVisibleClassName: ".Mui-focusVisible" }))`
    .Mui-focusVisible {
        background: var(--colors-primary-100);
    }
`, lc = Pe(({ FormControlProps: e, InputLabelProps: t, label: r, size: n = "small", ...o }) => /* @__PURE__ */ on(uo, { ...e, children: [
  /* @__PURE__ */ H(za, { id: `${o.id}-label`, ...t, children: r }),
  /* @__PURE__ */ H(lo, { "aria-labelledby": `${o.id}-label`, ...o, size: n })
] }))``, fc = Pe(({ onCloseText: e, children: t, onClose: r, ...n }) => /* @__PURE__ */ H(fo, { ...n, onClose: r, style: {
  zIndex: 999
}, children: /* @__PURE__ */ on("div", { className: Qt("w-full p-4 sm:min-w-[20rem] md:min-w-[37.5rem]"), children: [
  /* @__PURE__ */ H("div", { className: "mb-2 flex justify-end", children: /* @__PURE__ */ H(Ua, { variant: "text", endIcon: /* @__PURE__ */ H(Ba, { icon: "ic:baseline-close", className: "text-2xl" }), onClick: (o) => {
    r && r(o, "escapeKeyDown");
  }, className: "text-gray-800", children: e }) }),
  /* @__PURE__ */ H("div", { className: "px-4", children: t })
] }) }))``, dc = Pe((e) => /* @__PURE__ */ H(po, { classes: {
  root: "p-0 m-0 justify-center"
}, children: /* @__PURE__ */ H("div", { className: Qt("my-2 flex w-full justify-end space-x-4", e.className), children: e.children }) }))``, pc = Pe(({ children: e, classes: t, className: r, ...n }) => /* @__PURE__ */ H(mo, { ...n, classes: {
  ...t,
  root: "p-0 mx-0 mt-0 mb-4"
}, className: Qt("w-full", r), children: e }))``, mc = Pe(({ children: e, ...t }) => /* @__PURE__ */ H(ho, { ...t, classes: {
  root: "p-0 m-0"
}, children: /* @__PURE__ */ H("div", { className: "mb-4 flex items-baseline justify-between space-x-3 text-xl font-semibold leading-tight", children: /* @__PURE__ */ H("span", { children: e }) }) }))``, hc = Ce((e) => /* @__PURE__ */ H(yo, { ...e }))``, yc = Ce((e) => /* @__PURE__ */ H(go, { ...e }))``, gc = Ce(({ children: e, ...t }) => /* @__PURE__ */ H(vo, { autoHideDuration: t.autoHideDuration ?? 6e3, ...t, children: e && /* @__PURE__ */ H("div", { children: e }) }))``, vc = Ce((e) => /* @__PURE__ */ H(bo, { ...e, children: e.children }))``, bc = (e) => /* @__PURE__ */ H(Eo, { ...e, children: e.children });
function ar(e) {
  const t = {};
  for (const [r, n] of Object.entries(e))
    n.includes("var") ? Object.assign(t, {
      [`${r}`]: JSON.parse(JSON.stringify(getComputedStyle(document.body).getPropertyValue(n.replaceAll(/((var)|\(|\))/g, "")))).trim()
    }) : Object.assign(t, {
      [`${r}`]: n
    });
  return t;
}
const Ya = {
  50: "var(--colors-teal-50)",
  100: "var(--colors-teal-100)",
  200: "var(--colors-teal-200)",
  300: "var(--colors-teal-300)",
  400: "var(--colors-teal-400)",
  500: "var(--colors-teal-500)",
  600: "var(--colors-teal-600)",
  700: "var(--colors-teal-700)",
  800: "var(--colors-teal-800)",
  900: "var(--colors-teal-900)",
  light: "var(--colors-teal-50)",
  main: "var(--colors-teal-600)",
  dark: "var(--colors-teal-900)",
  contrastText: "#fff"
}, Va = {
  primary: Ya
}, qa = () => ({
  primary: ar(Va.primary)
}), Ka = {
  50: "var(--colors-xanadu-50)",
  100: "var(--colors-xanadu-100)",
  200: "var(--colors-xanadu-200)",
  300: "var(--colors-xanadu-300)",
  400: "var(--colors-xanadu-400)",
  500: "var(--colors-xanadu-500)",
  600: "var(--colors-xanadu-600)",
  700: "var(--colors-xanadu-700)",
  800: "var(--colors-xanadu-800)",
  900: "var(--colors-xanadu-900)",
  light: "var(--colors-xanadu-50)",
  main: "var(--colors-xanadu-600)",
  dark: "var(--colors-xanadu-900)",
  contrastText: "#fff"
}, Ga = {
  primary: Ka
}, Ha = () => ({
  primary: ar(Ga.primary)
});
const Ec = {
  greenish: {
    primary: qa().primary
  },
  fretex: {
    primary: Ha().primary,
    secondary: {
      100: "#EFF4F2",
      200: "#DEEBE5",
      300: "#C6D7D0",
      400: "#ADC6BC",
      500: "#9CB2A9",
      600: "#798B84",
      700: "#667670",
      800: "#454F4B"
    }
  },
  role: {
    patient: {
      light: "#DEE8E4",
      main: "#ff0000",
      dark: "#454F4B"
    },
    network: {
      light: "#DEE8E4",
      main: "#ff0000",
      dark: "#454F4B"
    }
  }
}, Ja = {
  50: "var(--colors-primary-50)",
  100: "var(--colors-primary-100)",
  200: "var(--colors-primary-200)",
  300: "var(--colors-primary-300)",
  400: "var(--colors-primary-400)",
  500: "var(--colors-primary-500)",
  600: "var(--colors-primary-600)",
  700: "var(--colors-primary-700)",
  800: "var(--colors-primary-800)",
  900: "var(--colors-primary-900)",
  light: "var(--colors-primary-50)",
  main: "var(--colors-primary-600)",
  dark: "var(--colors-primary-900)",
  contrastText: "#fff"
}, Xa = {
  primary: Ja
}, Qa = () => ({
  primary: ar(Xa.primary)
}), Sc = {
  palette: {
    primary: Qa().primary
    // error: {
    //     main: 'rgb(176, 0, 32)', // = '#b00020',
    //     light: '#ffaaaa',
    // },
    // success: {
    //     light: '#CBFFD9',
    //     main: '#EFCC1D',
    //     dark: '#388e3c',
    // },
    // warning: {
    //     light: '#FFF9C4',
    //     main: '#ffeb3b',
    //     dark: '#fbc02d',
    // },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 16,
    h1: {
      fontSize: "var(--text-h1)",
      fontWeight: 600,
      marginBottom: "1rem"
    },
    h2: {
      fontSize: "var(--text-h2)",
      fontWeight: 600,
      marginBottom: "1rem"
    },
    h3: {
      fontSize: "1rem",
      fontWeight: 600,
      marginBottom: "1rem"
    },
    subtitle1: {
      fontSize: "1rem",
      fontWeight: "normal"
    },
    subtitle2: {
      fontSize: "1rem",
      fontWeight: 500
    },
    body1: {
      fontSize: "var(--text-base)",
      fontWeight: "normal"
    },
    body2: {
      fontSize: "var(--text-small)",
      fontWeight: "normal"
    },
    button: {
      fontSize: "0.875rem",
      fontWeight: 500
    },
    caption: {
      fontSize: "0.625rem",
      fontWeight: "normal"
    },
    overline: {
      fontSize: "0.625rem",
      fontWeight: "normal"
    }
  }
};
export {
  hc as StyledAlert,
  yc as StyledAlertTitle,
  nc as StyledBadge,
  Ua as StyledButton,
  fc as StyledDialog,
  dc as StyledDialogActions,
  pc as StyledDialogContent,
  mc as StyledDialogTitle,
  ic as StyledFormControlLabel,
  sc as StyledFormHelperText,
  za as StyledFormLabel,
  ac as StyledInput,
  cc as StyledInputLabel,
  vc as StyledSelect,
  bc as StyledSelectItem,
  gc as StyledSnackbar,
  uc as StyledSwitch,
  lc as StyledTextField,
  oc as StyledTooltip,
  Ec as customPalettes,
  Sc as theme,
  ar as tokenOptimizer
};
