
from flask import render_template, redirect
from flask import current_app as app, Blueprint
import dash
from dash import Dash, html, Input, Output, dcc, MATCH, ALL, State
import plotly.graph_objects as go
import dash_dangerously_set_inner_html
from flask_login import login_required, current_user, user_accessed
import dash_bootstrap_components as dbc
import numpy as np
import sys
import json
import math

global count
count = 0
global precision
precision = 30
global speed_mode
speedmode = 1

global round_result
round_result = False
global negative_exception
negative_exception = True
FOR_USER_ANGLES = []
FOR_USER_ANGLES2 = []
UHLY_zaciatok = []
POS_X_zaciatok = []
POS_Y_zaciatok = []
POS_Z_zaciatok = []
SPEED_UP_VECTORS = []
SLIDERS = []
MAX_ANGLES = []
LIMITATIONS = []
LIMIT_INFOS = []
INPUTS = []
end_ef_pos = []
SMER = []
hom_from_0 = []
dis_from_0 = []
Clear_clicks = []
HOMOGENEOUSES = []
TRAJECTORY_X = []
TRAJECTORY_Y = []
TRAJECTORY_Z = []
C = []
S = []
UHLY = []
DH = []
THETAS = []
ALFAS = []
Rs = []
Ds = []
X, Y, Z = [], [], []

global layout


header = dash_dangerously_set_inner_html.DangerouslySetInnerHTML('''
    <header>
        <a class="logo" href="/help">
            <img src=/static/svg/svg2.svg alt="logo">
        </a>
        <nav>
            <ul class="nav__links">
                <li><a class=active href="/dash">Inverse kinematics</a></li>
                <li><a href="/">Design</a></li>
                <li><a href="/account">My account</a></li>
                <li><a href="/help">Help</a></li>
            </ul>
        </nav>
    </header>   
        
    ''')

footer = dash_dangerously_set_inner_html.DangerouslySetInnerHTML('''
        <div class=neviemus>
        <div class="footer-basic">
        <footer>
        <div class="social"><a href="https://instagram.com"><i class="icon ion-social-instagram"></i></a><a href="https://snapchat.com"><i class="icon ion-social-snapchat"></i></a><a href="https://twitter.com"><i class="icon ion-social-twitter"></i></a><a
            href="https://facebook.com"><i class="icon ion-social-facebook"></i></a></div>
        <p class="copyright">Created with <i class="icon icon ion-ios-heart"></i></i> by Adrián Hochla</p>
        </footer>
        </div>
        </div>
''')

layout = [
    html.Div([html.Div([html.Div('Trajectory planner', className="trajectory_planner"),dcc.Graph(id='robot_graph', figure={}), html.Button('Clear trajectory', id='clear_value', n_clicks=0, className='btn btn-outline-primary'),], className="robot_graph"),
    html.Div([html.Div('Control panel', className='ovladaci_panel'),html.Div([html.Div([html.Div('Current position:'),
                html.Div('X: ' ,id='akt-pos-x'),
                html.Div('Y: ' ,id='akt-pos-y'),
                html.Div('Z: ' ,id='akt-pos-z')], className='akt-pos'),
            html.Div([html.Div('New position:'),
                dcc.Input(className="novaPoziciaButton",
                    id="novX",
                    type="number",
                    placeholder="X",
                    ),
                dcc.Input(className="novaPoziciaButton",
                    id="novY",
                    type="number",
                    placeholder="Y",
                    ),
                dcc.Input(className="novaPoziciaButton",
                    id="novZ",
                    type="number",
                    placeholder="Z",
                    )], 
                className='nov-pos'),], className='set_position'),
                html.Button('Compute IK', id='submit-val', n_clicks=0, className='btn btn-primary')], className='panel')], className='test'),
    html.Div(),
    html.Div(),]
    
    
negative_angle_alert = dbc.Alert("Negative angle has been calculated, if you wish to continue with this trajectory, disable negative angle exception.", color="danger", dismissable=True)
                        # use dismissable or duration=5000 for alert to close in x milliseconds

maximum_angle_alert = dbc.Alert("Maximum angle of some of your joint has been preceeded. Choose different trajectory.", color="danger", dismissable=True)

singular_matrix_alert = dbc.Alert("It appears that this particular configuration is impossible to compute, due to inversion of singular matrix, please choose different starting angles.", color="danger", dismissable=True)


def init_dashboard(server):
    """Create a Plotly Dash dashboard."""
    global dash_app
    dash_app = Dash(
        server=server,
        routes_pathname_prefix='/dash/',
        external_stylesheets=['/static/css/IK.css', dbc.themes.BOOTSTRAP, {'href': 'https://cdnjs.cloudflare.com/ajax/libs/ionicons/2.0.1/css/ionicons.min.css',
        'rel': 'stylesheet',}],
        title="IK",
    )
    dash_app.layout = html.Div([header, html.Div(id="the_alert", children=[], className='ALERT'),html.Div(layout, className="whole_app"), footer], className='pinguin')

    init_callbacks(dash_app)
    return dash_app.server

def init_callbacks(dash_app):
    @dash_app.callback(
    [Output("the_alert", "children"),
    Output(component_id='robot_graph', component_property='figure'),
    Output("akt-pos-x", "children"),
    Output("akt-pos-y", "children"),
    Output("akt-pos-z", "children"),],
    [Input("novX", "value"),
    Input("novY", "value"),
    Input("novZ", "value"),
    Input('submit-val', 'n_clicks'),
    Input('clear_value', 'n_clicks'),],
)

    def update_graph(novX, novY, novZ, n_clicks, clear_clicks): 
        ctx = dash.callback_context
        if not ctx.triggered:
            button_id = 'No clicks yet'
        else:
            button_id = ctx.triggered[0]['prop_id'].split('.')[0]

        fig = go.Figure(data=go.Scatter3d(x=[0,0], y=[0,0], z=[0,0],name="Kinematic chain",marker=dict(
            size=4,
            colorscale='Viridis',   # choose a colorscale
            opacity=0.001), 
            line=dict(width=10)))
        
        if (isinstance(novX, float) or isinstance(novX, int)) and (isinstance(novY, float) or isinstance(novY, int)) and (isinstance(novZ, float) or isinstance(novZ, int)):
            fig.add_trace(go.Scatter3d(x=[novX],y=[novY],z=[novZ], name="Required position", marker=dict(
            size=6,)))   # add point
            #fig.update_traces(scene='scene', selector=dict(type='scatter3d'),)


        fig.update_layout(width=700, height=600, scene=dict(
            xaxis = dict(range=[-30,30],),
            yaxis = dict(range=[-30,30],),
            zaxis = dict(range=[0 ,60],),
            aspectmode='cube',
            uirevision="Don't change",))

        fig.update_layout(margin=dict(r=20, l=10, b=10, t=20))

        X.append(0)
        Y.append(0)
        Z.append(0)
        alert = False
        if len(DH) > 0:
            calculate_matricies()
            if 'submit' in button_id:
                if (isinstance(novX, float) or isinstance(novX, int)) and (isinstance(novY, float) or isinstance(novY, int)) and (isinstance(novZ, float) or isinstance(novZ, int)):
                    if speedmode == 1:
                        xBodka = (novX - X[-1]) / precision # higher number more precise:+_
                        yBodka = (novY - Y[-1]) / precision
                        zBodka = (novZ - Z[-1]) / precision
                        alert = get_constant_jacobian(novX, novY, novZ, xBodka, yBodka, zBodka)
                    
                    if speedmode == 2:
                        alert = get_slow_down_jacobian(novX, novY, novZ, True)
                    
                    if speedmode == 3:
                        xBodka = (novX - X[-1]) / precision # higher number more precise:+_
                        yBodka = (novY - Y[-1]) / precision
                        zBodka = (novZ - Z[-1]) / precision
                        get_slow_down_jacobian(novX, novY, novZ, True)
                        get_slow_down_jacobian(novX, novY, novZ, False)
                        alert = get_speed_up_jacobian(novX, novY, novZ)
            
            
            if 'clear' in button_id:
                FOR_USER_ANGLES.clear()
                for i in FOR_USER_ANGLES2:
                    i.clear()
                TRAJECTORY_X.clear()
                TRAJECTORY_Y.clear()
                TRAJECTORY_Z.clear()

            fig = go.Figure(data=go.Scatter3d(x=X, y=Y, z=Z,name="Kinematic chain", marker=dict(
            size=4,
            colorscale='Viridis'),   # choose a colorscale
            #opacity=0.8), 
            line=dict(width=10)))

            fig.update_layout(width=700, height=600, scene=dict(xaxis = dict(nticks=4, range=[-30,30],),
            yaxis = dict(nticks=4, range=[-30,30],),
            zaxis = dict(nticks=4, range=[0,60],),
            aspectmode='cube',uirevision="Don't change",))
            fig.update_layout(margin=dict(r=20, l=10, b=10, t=20))
            if (isinstance(novX, float) or isinstance(novX, int)) and (isinstance(novY, float) or isinstance(novY, int)) and (isinstance(novZ, float) or isinstance(novZ, int)):
                fig.add_trace(go.Scatter3d(x=[novX],y=[novY],z=[novZ],name="Required position", marker=dict(
            size=6,))) 
            if len(TRAJECTORY_X) > 0 and len(TRAJECTORY_Y) > 0 and len(TRAJECTORY_Z) > 0:
                fig.add_trace(go.Scatter3d(x=TRAJECTORY_X,y=TRAJECTORY_Y,z=TRAJECTORY_Z,name="End-efector trajectory", marker=dict(
                        size=3, color='mediumaquamarine'))) #CSS COLORS heheee

        
        fig.update_layout({
            'plot_bgcolor': 'rgba(0, 0, 0, 0)',
            'paper_bgcolor': 'rgba(0, 0, 0, 0)',
            })

        if alert:
            return alert, fig, f"X: {round(X[-1],2)}cm", f"Y: {round(Y[-1], 2)}cm", f"Z: {round(Z[-1],2)}cm"
        else:
            return dash.no_update, fig, f"X: {round(X[-1],2)}cm", f"Y: {round(Y[-1], 2)}cm", f"Z: {round(Z[-1],2)}cm"
    
    @dash_app.callback(
        Output({'type': 'slider-output', 'index': MATCH}, 'children'),
        [Input({'type': 'slider', 'index': MATCH}, 'value'),
        Input('submit-val', 'n_clicks'),
        Input("novX", "value"),
        Input("novY", "value"),
        Input("novZ", "value"),
        Input('submit-val', 'n_clicks'),
        Input('clear_value', 'n_clicks'),],
        State({'type': 'slider', 'index': MATCH}, 'id'))

    def display_output(value,clicks,x,y,z,s,c,id):
        ctx = dash.callback_context
        if not ctx.triggered:
            button_id = 'No clicks yet'
        else:
            button_id = ctx.triggered[0]['prop_id'].split('.')[0]
        
        if 'slider' in button_id:
            UHLY.insert(id['index'], value)
            UHLY.pop(id['index']+1)
        return html.Div('Angle of joint {} = {}°'.format(id['index'] + 1, round(UHLY[id['index']]),2), className="bold_text")
 
    
    @dash_app.callback(
        Output({'type': 'input-output', 'index': MATCH}, 'children'),
        Input({'type': 'input', 'index': MATCH}, 'value'),
        State({'type': 'input', 'index': MATCH}, 'id'))

    def display(value, id):
        MAX_ANGLES.insert(id['index'], value)
        MAX_ANGLES.pop(id['index']+1)
        return html.Div()

    @dash_app.callback(
        Output({'type': 'slider_limit_output', 'index': MATCH}, 'children'),
        Input({'type': 'slider_limit', 'index': MATCH}, 'value'),
        State({'type': 'slider_limit', 'index': MATCH}, 'id'))

    def sldier_limnit(value, id):
        if value == 0:
            text = 'Low precision is on average 8 calculations per centimeter of trajectory. Longer trajectories than 15 centimeters on constant speed mode are not advised.'
            global precision
            precision = 15
        if value == 1:
            text = 'Medium precision is on average 14 calculations per centimeter of trajectory.'
            precision = 25
        if value == 2:
            text = 'High precision is on average 20 calculations per centimeter of trajetory.'
            precision = 35
        return html.Div(f'{text}', className='limit_text_info')

    @dash_app.callback(
        Output('speed_output', 'children'),
        Input('speed_mode', 'value'),)

    def display(value):
        global speedmode
        speedmode = value
        return html.Div()

    @dash_app.callback(
        Output('my-checklist-output', 'children'),
        Input('my-checklist', 'value'),)

    def display(value):
        global negative_exception
        if value:
            negative_exception = True
            text = 'Prevent computations of negative angles'
        else:
            negative_exception = False
            text = 'Ignore computations of negative angles'
        return html.Div(text)

    @dash_app.callback(
        Output('my-checklist2-output', 'children'),
        Input('my-checklist2', 'value'),)

    def display(value):
        global round_result
        if value:
            round_result = True
        else:
            round_result = False  
        print(round_result)
        return ''

    @dash_app.callback(
        Output('get_angles_output', 'children'),
        [Input('get_angles', 'n_clicks'),
        Input('button_arrays', 'value'),])

    def get(clicks, value):
        ctx = dash.callback_context
        if not ctx.triggered:
            button_id = 'No clicks yet'
        else:
            button_id = ctx.triggered[0]['prop_id'].split('.')[0]

        if value == 1:
                text = 'After pressing this button, you will recieve angles of your joints for current trajectory as list of lists.'
        else:
            text = 'After pressing this button, you will recieve angles of your joints for current trajectory as list for each joint.'
        
        if 'get' in button_id and (len(FOR_USER_ANGLES2[0]) > 0 or len(FOR_USER_ANGLES) > 0):
            if value == 1:
                text = f'{FOR_USER_ANGLES}'  
            else:
                text = f'{FOR_USER_ANGLES2}'
        return text


def get_speed_up_jacobian(x, y, z):
    g = 0
    UHLY.clear()
    UHLY.extend(UHLY_zaciatok)
    UHLY_zaciatok.clear()

    for vector in reversed(SPEED_UP_VECTORS):
        calculate_matricies()
        jed_matica = np.matrix([[0], [0], [1]])
        prvy_element = np.cross(jed_matica, dis_from_0[-1], axis=0)
        JACOBIAN = np.matrix([[prvy_element.item(0)],
                              [prvy_element.item(1)],
                              [prvy_element.item(2)]])

        b = 0
        for b,i in enumerate(hom_from_0[:-1]):
            rotx = float(i[0:1, 2:3])
            roty = float(i[1:2, 2:3])
            rotz = float(i[2:3, 2:3])
            rot = np.matrix([[rotx], [roty], [rotz]])
            displacement = np.subtract(dis_from_0[-1], dis_from_0[b])
            col = np.cross(rot, displacement, axis=0)
            JACOBIAN = np.append(JACOBIAN, col, axis=1)

        Jt = JACOBIAN.transpose()
        JJt = np.matmul(JACOBIAN, Jt)
        if np.linalg.cond(JJt) < 1/sys.float_info.epsilon:
            JJtinv = np.linalg.inv(JJt)
        else:
            return singular_matrix_alert

        JtJJtinv = np.matmul(Jt, JJtinv)

        docasne = []
        for i in range(0, len(UHLY)):
            ThetaBodka = JtJJtinv.item(3*i) * -vector[0] + JtJJtinv.item((i*3)+1) * -vector[1] + JtJJtinv.item((i*3)+2) * -vector[2]
            ZvysTheta = ThetaBodka * 50
            Uhol = (UHLY[i]) + ZvysTheta
            if MAX_ANGLES[i]:
                if Uhol > MAX_ANGLES[i] or Uhol < 0:
                    #uhol je pre reťacez užívateľa neplatný
                    return
            UHLY.insert(i, Uhol)
            UHLY.pop(i+1)
            if round_result:
                FOR_USER_ANGLES2[i].append(round(Uhol))
                docasne.append(round(Uhol))
            else:
                FOR_USER_ANGLES2[i].append(round(Uhol,2))
                docasne.append(round(Uhol,2))

        SPEED_UP_VECTORS.remove(vector)
        for j,i in enumerate(docasne):
            if negative_exception:
                if i < 0:
                    return negative_angle_alert

            if MAX_ANGLES[j]:
                if i > MAX_ANGLES[j]:
                    return maximum_angle_alert
        
        FOR_USER_ANGLES.append(docasne)

        newx = X[-1]
        newy = Y[-1]
        newz = Z[-1]

        TRAJECTORY_X.append(newx)
        TRAJECTORY_Y.append(newy)
        TRAJECTORY_Z.append(newz)

        rozdiel = ((x - newx) * (x - newx) + (y - newy) * (y - newy) + (z - newz) * (z - newz)) ** (1 / 2)
        if 0.10 < rozdiel < 0.25:
            print(g)
            return

        if g == 2000:
            print(g)
            calculate_matricies()
            return
        g = g + 1


def get_slow_down_jacobian(x, y, z, slow_down):
    if slow_down:
        UHLY_zaciatok.clear()
        POS_X_zaciatok.clear()
        POS_Y_zaciatok.clear()
        POS_Z_zaciatok.clear()
        UHLY_zaciatok.extend(UHLY)
        POS_X_zaciatok.extend(X)
        POS_Y_zaciatok.extend(Y)
        POS_Z_zaciatok.extend(Z)

    if not slow_down:
        x = POS_X_zaciatok[-1]
        y = POS_Y_zaciatok[-1]
        z = POS_Z_zaciatok[-1]

    for g in range(0, 1000):
        calculate_matricies()
        jed_matica = np.matrix([[0], [0], [1]])
        prvy_element = np.cross(jed_matica, dis_from_0[-1], axis=0)
        JACOBIAN = np.matrix([[prvy_element.item(0)],
                              [prvy_element.item(1)],
                              [prvy_element.item(2)]])

     
        for b,i in enumerate(hom_from_0[:-1]):
            rotx = float(i[0:1, 2:3])
            roty = float(i[1:2, 2:3])
            rotz = float(i[2:3, 2:3])
            rot = np.matrix([[rotx], [roty], [rotz]])
            displacement = np.subtract(dis_from_0[-1], dis_from_0[b])
            col = np.cross(rot, displacement, axis=0)
            JACOBIAN = np.append(JACOBIAN, col, axis=1)

        Jt = JACOBIAN.transpose()
        JJt = np.matmul(JACOBIAN, Jt)
        if np.linalg.cond(JJt) < 1/sys.float_info.epsilon:
            JJtinv = np.linalg.inv(JJt)
        else:
            return singular_matrix_alert

        JtJJtinv = np.matmul(Jt, JJtinv)

        xBodka =  (x - X[-1]) / precision # higher number more precise:+_
        yBodka =  (y - Y[-1]) / precision 
        zBodka =  (z - Z[-1]) / precision 
        if not slow_down:
            SPEED_UP_VECTORS.append([xBodka, yBodka, zBodka])

        docasne = []
        for i in range(0, len(UHLY)):
            ThetaBodka = JtJJtinv.item(3*i) * xBodka + JtJJtinv.item((i*3)+1) * yBodka + JtJJtinv.item((i*3)+2) * zBodka 
            ZvysTheta = ThetaBodka * 50

            Uhol = (UHLY[i]) + ZvysTheta
            if MAX_ANGLES[i]:
                if Uhol > MAX_ANGLES[i] or Uhol < 0:
                    #uhol je pre reťacez užívateľa neplatný
                    return
            UHLY.insert(i, Uhol)
            UHLY.pop(i+1)
            if round_result:
                FOR_USER_ANGLES2[i].append(round(Uhol))
                docasne.append(round(Uhol))
            else:
                FOR_USER_ANGLES2[i].append(round(Uhol,2))
                docasne.append(round(Uhol,2))

        newx = X[-1]
        newy = Y[-1]
        newz = Z[-1]

        if speedmode != 3:
            for j,i in enumerate(docasne):
                if negative_exception:
                    if i < 0:
                        return negative_angle_alert

                if MAX_ANGLES[j]:
                    if i > MAX_ANGLES[j]:
                        return maximum_angle_alert
        
            FOR_USER_ANGLES.append(docasne)

            TRAJECTORY_X.append(newx)
            TRAJECTORY_Y.append(newy)
            TRAJECTORY_Z.append(newz)


        rozdiel = ((x - newx) * (x - newx) + (y - newy) * (y - newy) + (z - newz) * (z - newz)) ** (1 / 2)
 
        if 0.10 < rozdiel < 0.25:
            print(g)
            return

        if g == 1000:
            print(g)
            calculate_matricies()
            return


def get_constant_jacobian(x, y, z, x_dot, y_dot, z_dot):
    xBodka = x_dot
    yBodka = y_dot
    zBodka = z_dot
   
    for g in range(0, 1000):
        calculate_matricies()

        jed_matica = np.matrix([[0], [0], [1]])
        prvy_element = np.cross(jed_matica, dis_from_0[-1], axis=0)
        JACOBIAN = np.matrix([[prvy_element.item(0)],
                              [prvy_element.item(1)],
                              [prvy_element.item(2)]])

        for b,i in enumerate(hom_from_0[:-1]):
            rotx = float(i[0:1, 2:3])
            roty = float(i[1:2, 2:3])
            rotz = float(i[2:3, 2:3])
            rot = np.matrix([[rotx], [roty], [rotz]])
            displacement = np.subtract(dis_from_0[-1], dis_from_0[b])
            col = np.cross(rot, displacement, axis=0)
            JACOBIAN = np.append(JACOBIAN, col, axis=1)

        Jt = JACOBIAN.transpose()
        JJt = np.matmul(JACOBIAN, Jt)

        if np.linalg.cond(JJt) < 1/sys.float_info.epsilon:
            JJtinv = np.linalg.inv(JJt)
        else:
            return singular_matrix_alert

        JtJJtinv = np.matmul(Jt, JJtinv)

        docasne = []
        for i in range(0, len(UHLY)):
            ThetaBodka = JtJJtinv.item(3*i) * xBodka + JtJJtinv.item((i*3)+1) * yBodka + JtJJtinv.item((i*3)+2) * zBodka 
            ZvysTheta = ThetaBodka * 10
            Uhol = (UHLY[i]) + ZvysTheta
       
            UHLY.insert(i, Uhol)
            UHLY.pop(i+1)
            if round_result:
                FOR_USER_ANGLES2[i].append(round(Uhol))
                docasne.append(round(Uhol))
            else:
                FOR_USER_ANGLES2[i].append(round(Uhol,2))
                docasne.append(round(Uhol,2))

        for j,i in enumerate(docasne):
            if negative_exception:
                if i < 0:
                    return negative_angle_alert

            if MAX_ANGLES[j]:
                if i > MAX_ANGLES[j]:
                    return maximum_angle_alert
        
        FOR_USER_ANGLES.append(docasne)

        newx = X[-1]
        newy = Y[-1]
        newz = Z[-1]
        TRAJECTORY_X.append(newx)
        TRAJECTORY_Y.append(newy)
        TRAJECTORY_Z.append(newz)

        rozdiel = ((x - newx) * (x - newx) + (y - newy) * (y - newy) + (z - newz) * (z - newz)) ** (1 / 2)
        if 0.10 < rozdiel < 0.25:
            print(g)
            return

        if g == 2000:
            print(g)
            calculate_matricies()
            return



    
def calculate_matricies():
    hom_from_0.clear()
    dis_from_0.clear()
    HOMOGENEOUSES.clear()
    X.clear()
    Y.clear()
    Z.clear()
    for i in range (0, len(UHLY)):
        SIN = math.sin((UHLY[i] * 0.0174532925) + THETAS[i])
        COS = math.cos((UHLY[i] * 0.0174532925) + THETAS[i])

        a = np.array([COS, -SIN * math.cos(ALFAS[i]), SIN * math.sin(ALFAS[i]), COS * Rs[i]])
        b = np.array([SIN, COS * math.cos(ALFAS[i]), -COS * math.sin(ALFAS[i]), SIN * Rs[i]])
        c = np.array([0, math.sin(ALFAS[i]), math.cos(ALFAS[i]), Ds[i]])
        d = np.array([0, 0, 0, 1])

        HOMOGENEOUSES.append(np.matrix([a, b, c, d]))

    H0x = np.array([[1,0,0,0],
                    [0,1,0,0],
                    [0,0,1,0],
                    [0,0,0,1]])

    xStart = 0
    yStart = 0
    zStart = 0
    for i in HOMOGENEOUSES:
        H0x = np.matmul(H0x, i)
        hom_from_0.append(H0x)
        
        X.append(xStart)
        X.append(float(H0x[0:1, 3:4]))
        Y.append(yStart)
        Y.append(float(H0x[1:2, 3:4]))
        Z.append(zStart)
        Z.append(float(H0x[2:3, 3:4]))

        xStart = float(H0x[0:1, 3:4])
        yStart  = float(H0x[1:2, 3:4])
        zStart = float(H0x[2:3, 3:4])

        dis = np.matrix([[xStart],[yStart],[zStart]])
        dis_from_0.append(dis)


count = 0
@app.route("/processUserInfo/<string:userInfo>", methods=['POST'])
def render_dashboard(userInfo):
    global DH
    DH = [json.loads(userInfo)]
    ALFAS.clear()
    THETAS.clear()
    SLIDERS.clear()
    LIMITATIONS.clear()
    LIMIT_INFOS.clear()
    FOR_USER_ANGLES2.clear()
    FOR_USER_ANGLES.clear()
    Rs.clear()
    Ds.clear()
    UHLY.clear()
    INPUTS.clear()
    MAX_ANGLES.clear()
    TRAJECTORY_X.clear()
    TRAJECTORY_Y.clear()
    TRAJECTORY_Z.clear()
    layout.pop()
    layout.pop()
    layout.pop()

    graph = html.Div([html.Div('Trajectory planner', className="trajectory_planner"),dcc.Graph(id='robot_graph', figure={}), html.Button('Clear trajectory', id='clear_value', n_clicks=0, className='btn btn-outline-primary'),], className="robot_graph")
    panel = html.Div([html.Div('Control panel', className='ovladaci_panel'),html.Div([html.Div([html.Div('Current position:'),
                html.Div('X: ' ,id='akt-pos-x'),
                html.Div('Y: ' ,id='akt-pos-y'),
                html.Div('Z: ' ,id='akt-pos-z')], className='akt-pos'),
            html.Div([html.Div('New position:'),
                dcc.Input(className="novaPoziciaButton",
                    id="novX",
                    type="number",
                    placeholder="X",
                    ),
                dcc.Input(className="novaPoziciaButton",
                    id="novY",
                    type="number",
                    placeholder="Y",
                    ),
                dcc.Input(className="novaPoziciaButton",
                    id="novZ",
                    type="number",
                    placeholder="Z",
                    )], 
                className='nov-pos'),], className='set_position'),
                html.Button('Compute IK', id='submit-val', n_clicks=0, className='btn btn-primary')], className='panel')

    if len(DH) > 0:
        for i in DH[0]:
            THETAS.append(i[0] * 0.0174532925)
            ALFAS.append(i[1] * 0.0174532925)
            Rs.append(i[2])
            Ds.append(i[3])
            MAX_ANGLES.append(360)
            FOR_USER_ANGLES2.append([])
    
        for i in range(0, len(THETAS)):
            slider = dcc.Slider(0,MAX_ANGLES[i], id={'type': 'slider', 'index':i}, value=0,  marks={
        0: {'label': '0°'},
        45: {'label': '45°'},
        90: {'label': '90°'},
        135: {'label': '135°'},
        180: {'label': '180°'},
        225: {'label': '225°'},
        270: {'label': '270°'},
        315: {'label': '315°'},
        360: {'label': '360°'},
    },)
            empty_div = html.Div(id={'type': 'input-output', 'index': i}) 
            input = dcc.Input(id={'type': 'input', 'index':i},type="number",placeholder="Max angle in °",className='angle_input')
            slider_output = html.Div([html.Div(id={'type': 'slider-output', 'index':i}), input], className='limitations')
            SLIDERS.append(html.Div([slider_output, slider, empty_div], className='slider'))
            UHLY.append(0)
        
        
        precision_slider = dcc.Slider(0,2, step=1,id={'type': 'slider_limit', 'index':i}, value=1,  marks={
        0: {'label': 'Low', 'style': {'color': '#40E0D0 '}},
        1: {'label': 'Medium', 'style': {'color': '#E67E22 '}},
        2: {'label': 'High', 'style': {'color': '#FF5733'}}},)
        limit_text = html.Div('Set presicion (number of) calculations', className="limit_text")
        limit_div = html.Div(id={'type': 'slider_limit_output', 'index':i})
        LIMIT_INFOS.append(limit_text) 
        LIMIT_INFOS.append(precision_slider)
        LIMIT_INFOS.append(limit_div)
        mode = dcc.RadioItems(id='speed_mode',options=[
                                {'label': ' Constant', 'value': 1},
                                {'label': ' Slow-down', 'value': 2},
                                {'label': ' Speed-up', 'value': 3},],
                                value=1, inline=False, className="mode_flex")
        mode_div = html.Div([html.Div('Speed mode of your end-effector', className="set_speed_mode_text") , mode, html.Div(id='speed_output')], className="mode_input")
        check_box = dcc.Checklist(id='my-checklist', options=[{'label': ' Negative angle exception', 'value': True,'disabled':False}],
        value=[True])
        check_box_output = html.Div(id='my-checklist-output')

        round = dcc.Checklist(id='my-checklist2', options=[{'label': ' Round results', 'value': True,'disabled':False}],
        value=False)
        roundDiv = html.Div(id='my-checklist2-output')

        button = html.Button('Get angles', id='get_angles', n_clicks=0, className='btn btn-outline-success')
        button_output = html.Div(id='get_angles_output')
        button_arrays = dcc.RadioItems(id='button_arrays',options=[
                                {'label': ' List of lists', 'value': 1},
                                {'label': ' List for each joint', 'value': 2}], value=1)

        mode_div_combined = html.Div([mode_div, html.Div(LIMIT_INFOS, className="limitka"),html.Div([check_box, check_box_output], className="checkbox"), html.Div([button,button_output,button_arrays, round, roundDiv], className='button_group')], className="choose_mode")
        info = html.Div([panel, html.Div('Set starting joint angles with sliders and limitations of your robot with maximum angles each joint can rotate about.', className='info') ,html.Div(SLIDERS, className="angle_controls")], className="info_a_uhly")
        
        
        layout.append(graph)
        layout.append(info)
        layout.append(mode_div_combined)
        
    
    return redirect('/dash')

@app.route('/')
def home():
    return render_template('dizajn.html', user=current_user)


@app.route('/sign-up')
def signup():
    return render_template('signup.html', user=current_user)

@app.route('/log-in')
def login():
    return render_template('login.html', user=current_user)

@app.route('/account')
@login_required
def account():
    return render_template('account.html', user=current_user)

@app.route('/help')
def help():
    return render_template('help.html', user=current_user)



